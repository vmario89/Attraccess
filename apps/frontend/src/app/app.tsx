import { Route, Routes, useNavigate } from 'react-router-dom';
import { Unauthorized } from './unauthorized/unauthorized';
import { useTheme } from '@heroui/use-theme';
import { useEffect, useMemo } from 'react';
import { Layout } from './layout/layout';
import { useAuth } from '../hooks/useAuth';
import { Loading } from './loading';
import { RouteConfig, useAllRoutes } from './routes';
import { VerifyEmail } from './verifyEmail';
import { ToastProvider } from '../components/toastProvider';
import { HeroUIProvider } from '@heroui/react';
import { SystemPermissions } from '@attraccess/react-query-client';

function useRoutesWithAuthElements(routes: RouteConfig[]) {
  const { user } = useAuth();

  const routesWithAuthElements = useMemo(() => {
    return routes.map((route) => {
      if (!route.authRequired) {
        return route;
      }

      if (route.authRequired === true && user) {
        return route;
      }

      if (!user) {
        return {
          ...route,
          element: <Unauthorized />,
        };
      }

      const requiredPermissions = (
        Array.isArray(route.authRequired) ? route.authRequired : [route.authRequired]
      ) as (keyof SystemPermissions)[];

      const userHasAllRequiredPermissions = requiredPermissions.every(
        (permission) => user.systemPermissions[permission] === true
      );

      if (!userHasAllRequiredPermissions) {
        return {
          ...route,
          element: <Unauthorized />,
        };
      }

      return route;
    });
  }, [routes, user]);

  return useMemo(
    () =>
      routesWithAuthElements.map((route: RouteConfig, index) => (
        <Route key={index} path={route.path} element={route.element} />
      )),
    [routesWithAuthElements]
  );
}

export function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  const allRoutes = useAllRoutes();
  const routesWithAuthElements = useRoutesWithAuthElements(allRoutes);

  // set theme based on system preference of browser
  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemTheme);

    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
    }

    const darkBackground = 'rgb(0,0,0)';
    const lightBackground = 'rgb(255,255,255)';

    metaTheme.setAttribute('content', systemTheme === 'dark' ? darkBackground : lightBackground);
  }, [setTheme]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return <Loading />;
  }

  return (
    <HeroUIProvider navigate={navigate}>
      <ToastProvider>
        <Layout noLayout={!isAuthenticated}>
          <Routes>
            <Route path="/verify-email" element={<VerifyEmail />} />

            {routesWithAuthElements}

            {!isAuthenticated && <Route path="*" element={<Unauthorized />} />}
          </Routes>
        </Layout>
      </ToastProvider>
    </HeroUIProvider>
  );
}

export default App;
