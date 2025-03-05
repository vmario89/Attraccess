import { Route, Routes } from 'react-router-dom';
import { Unauthorized } from './unauthorized/unauthorized';
import { useTheme } from '@heroui/use-theme';
import { useEffect } from 'react';
import { Layout } from './layout/layout';
import { useAuth } from '../hooks/useAuth';
import { Loading } from './loading';
import { authorizedRoutes } from './authorized-routes';
import { VerifyEmail } from './verifyEmail';
import { ToastProvider } from '../components/toastProvider';

export function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { setTheme } = useTheme();

  // set theme based on system preference of browser
  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    setTheme(systemTheme);

    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
    }

    const darkBackground = 'rgb(0,0,0)';
    const lightBackground = 'rgb(255,255,255)';

    metaTheme.setAttribute(
      'content',
      systemTheme === 'dark' ? darkBackground : lightBackground
    );
  }, [setTheme]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return <Loading />;
  }

  return (
    <ToastProvider>
      <Layout noLayout={!isAuthenticated}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmail />} />

          {isAuthenticated &&
            authorizedRoutes.map((props, routeIndex) => (
              <Route {...props} key={routeIndex} />
            ))}

          {!isAuthenticated && <Route path="*" element={<Unauthorized />} />}
        </Routes>
      </Layout>
    </ToastProvider>
  );
}

export default App;
