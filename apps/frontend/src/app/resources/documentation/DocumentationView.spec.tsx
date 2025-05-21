import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentationView } from './DocumentationView';
import { DocumentationType } from '@attraccess/database-entities';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/i18n';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as reactQuery from '@tanstack/react-query';

// Mock react-markdown
jest.mock('react-markdown', () => {
  return ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>;
});

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
}));

// Mock useResourceQuery
jest.mock('@attraccess/react-query-client', () => ({
  useResourceQuery: jest.fn(),
}));

describe('DocumentationView', () => {
  const mockResource = {
    id: 1,
    name: 'Test Resource',
    description: 'Test Description',
    documentationType: DocumentationType.MARKDOWN,
    documentationMarkdown: '# Test Documentation\n\nThis is a test documentation.',
    documentationUrl: null,
  };

  const mockRefetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (reactQuery.useQueryClient as jest.Mock) = jest.fn(() => ({
      invalidateQueries: jest.fn(),
    }));
    
    // Mock useResourceQuery
    (require('@attraccess/react-query-client').useResourceQuery as jest.Mock).mockReturnValue({
      data: mockResource,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });
  });

  it('should render markdown documentation', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/resources/1/documentation']}>
          <Routes>
            <Route path="/resources/:id/documentation" element={<DocumentationView />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Test Resource')).toBeInTheDocument();
    });

    // Check if markdown content is rendered
    expect(screen.getByTestId('markdown')).toHaveTextContent('# Test Documentation');
    expect(screen.getByTestId('markdown')).toHaveTextContent('This is a test documentation.');
  });

  it('should render URL documentation in iframe', async () => {
    const urlResource = {
      ...mockResource,
      documentationType: DocumentationType.URL,
      documentationMarkdown: null,
      documentationUrl: 'https://example.com/docs',
    };

    (require('@attraccess/react-query-client').useResourceQuery as jest.Mock).mockReturnValue({
      data: urlResource,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });

    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/resources/1/documentation']}>
          <Routes>
            <Route path="/resources/:id/documentation" element={<DocumentationView />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Test Resource')).toBeInTheDocument();
    });

    // Check if iframe is rendered
    const iframe = screen.getByTitle('documentation-iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://example.com/docs');
  });

  it('should show loading state', async () => {
    (require('@attraccess/react-query-client').useResourceQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: true,
    });

    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/resources/1/documentation']}>
          <Routes>
            <Route path="/resources/:id/documentation" element={<DocumentationView />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );

    // Check if loading state is shown
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    (require('@attraccess/react-query-client').useResourceQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load resource'),
      refetch: mockRefetch,
      isFetching: false,
    });

    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/resources/1/documentation']}>
          <Routes>
            <Route path="/resources/:id/documentation" element={<DocumentationView />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );

    // Check if error state is shown
    expect(screen.getByText('Error loading resource')).toBeInTheDocument();
  });

  it('should navigate to edit page when edit button is clicked', async () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({ id: '1' }),
      useNavigate: () => mockNavigate,
    }));

    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/resources/1/documentation']}>
          <Routes>
            <Route path="/resources/:id/documentation" element={<DocumentationView />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Test Resource')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Check if navigation occurred
    expect(window.location.pathname).toContain('/resources/1/documentation');
  });

  it('should refetch data when refresh button is clicked', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/resources/1/documentation']}>
          <Routes>
            <Route path="/resources/:id/documentation" element={<DocumentationView />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    );

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Test Resource')).toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Check if refetch was called
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});