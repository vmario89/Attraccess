import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './app/app';
import './i18n';
import { HeroUIProvider } from '@heroui/react';
import { queryClient } from './api/queryClient';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HeroUIProvider>
    </QueryClientProvider>
  </StrictMode>
);
