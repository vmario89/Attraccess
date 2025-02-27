import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from './app';
import { TestWrapper } from '../test-utils/wrappers';
import { Route } from 'react-router-dom';

// Mock the auth hook
jest.mock('../hooks/useAuth', () => ({
  __esModule: true,
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: '1', email: 'test@example.com' },
  }),
}));

// Mock the theme hook
jest.mock('@heroui/use-theme', () => ({
  __esModule: true,
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

// Mock the authorized routes
jest.mock('./authorized-routes', () => ({
  __esModule: true,
  authorizedRoutes: [
    {
      path: '/',
      element: () => <div>Welcome to Attraccess</div>,
    },
  ],
}));

describe('App', () => {
  it('should render successfully', () => {
    render(
      <TestWrapper
        initialRoute="/"
        routes={<Route path="/" element={<App />} />}
      />
    );
    expect(screen.getByText('Resource Manager')).toBeInTheDocument();
  });

  it('should have the correct title', () => {
    render(
      <TestWrapper
        initialRoute="/"
        routes={<Route path="/" element={<App />} />}
      />
    );
    expect(screen.getByText('Resource Manager')).toBeInTheDocument();
  });
});
