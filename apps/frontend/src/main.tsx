import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './app/app';
import './i18n';
import { queryClient } from './api/queryClient';
import setupApiParameters from './api';
import { PluginProvider } from './plugins/plugin-provider';

setupApiParameters();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PluginProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PluginProvider>
    </QueryClientProvider>
  </StrictMode>
);
