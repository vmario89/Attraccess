import { Route, Routes, Link } from 'react-router-dom';
import { useAppState } from './app.state';
import { Unauthorized } from './unauthorized/unauthorized';
import { useTheme } from '@heroui/use-theme';
import { useEffect } from 'react';
export function App() {
  const auth = useAppState((state) => state.auth);
  const { setTheme } = useTheme();

  // set theme based on system preference of browser
  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    setTheme(systemTheme);
  }, [setTheme]);

  if (!auth) {
    return <Unauthorized />;
  }

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{' '}
              <Link to="/page-2">Click here for page 2.</Link>
            </div>
          }
        />
        <Route
          path="/page-2"
          element={
            <div>
              <Link to="/">Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
