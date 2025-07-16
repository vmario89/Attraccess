import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './app/app';
import '@fabaccess/plugins-frontend-ui';
import { queryClient } from './api/queryClient';
import setupApiParameters from './api';
import { PluginProvider } from './app/plugins/plugin-provider';
import { PWAInstall } from './components/pwaInstall';
import { registerSW } from 'virtual:pwa-register';

const oneMinute = 60 * 1000;
const intervalMS = 15 * oneMinute;

let updateInterval: NodeJS.Timeout;
registerSW({
  onRegistered(r) {
    if (!r) {
      return;
    }

    const startUpdateCheck = () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }

      updateInterval = setInterval(() => r.update(), intervalMS);
    };

    const stopUpdateCheck = () => {
      clearInterval(updateInterval);
    };

    // Start/stop checks based on page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopUpdateCheck();
      } else {
        r.update(); // Check once immediately
        startUpdateCheck();
      }
    });

    // Initial start if page is visible
    if (!document.hidden) {
      startUpdateCheck();
    }
  },
});

setupApiParameters();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <PluginProvider>
        <StrictMode>
          <PWAInstall />
          <App />
        </StrictMode>
      </PluginProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
