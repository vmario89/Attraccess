import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentationModal } from '../DocumentationModal';
import { useResourcesServiceGetOneResourceById } from '@attraccess/react-query-client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DocumentationType } from '../types';

// Mock react-markdown
jest.mock('react-markdown', () => require('./mocks/react-markdown').default);

// Mock the dependencies
jest.mock('@attraccess/react-query-client', () => ({
  useResourcesServiceGetOneResourceById: jest.fn(),
  UseResourcesServiceGetOneResourceByIdKeyFn: jest.fn().mockReturnValue(['ResourcesService', 'getOneResourceById', { id: 1 }]),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@attraccess/plugins-frontend-ui', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

describe('DocumentationModal', () => {
  const mockNavigate = jest.fn();
  const mockPrefetchQuery = jest.fn();
  const mockFetchQuery = jest.fn();
  const mockRefetch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    
    (useQueryClient as jest.Mock).mockReturnValue({
      prefetchQuery: mockPrefetchQuery,
      fetchQuery: mockFetchQuery,
    });
  });
  
  it('renders a button that opens the modal', () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });
    
    render(
      <DocumentationModal resourceId={1}>
        {(onOpen) => <button onClick={onOpen}>Open Documentation</button>}
      </DocumentationModal>
    );
    
    expect(screen.getByText('Open Documentation')).toBeInTheDocument();
  });
  
  it('shows loading state when fetching data', async () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });
    
    render(
      <DocumentationModal resourceId={1}>
        {(onOpen) => <button onClick={onOpen}>Open Documentation</button>}
      </DocumentationModal>
    );
    
    // Open the modal
    fireEvent.click(screen.getByText('Open Documentation'));
    
    // Check if loading state is shown
    expect(await screen.findByText('loading')).toBeInTheDocument();
  });
  
  it('shows error state when there is an error', async () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Test error'),
      refetch: mockRefetch,
      isFetching: false,
    });
    
    render(
      <DocumentationModal resourceId={1}>
        {(onOpen) => <button onClick={onOpen}>Open Documentation</button>}
      </DocumentationModal>
    );
    
    // Open the modal
    fireEvent.click(screen.getByText('Open Documentation'));
    
    // Check if error state is shown
    expect(await screen.findByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('actions.retry')).toBeInTheDocument();
  });
  
  it('shows no documentation message when resource has no documentation', async () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        name: 'Test Resource',
        documentationType: null,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });
    
    render(
      <DocumentationModal resourceId={1}>
        {(onOpen) => <button onClick={onOpen}>Open Documentation</button>}
      </DocumentationModal>
    );
    
    // Open the modal
    fireEvent.click(screen.getByText('Open Documentation'));
    
    // Check if no documentation message is shown
    expect(await screen.findByText('noDocumentation')).toBeInTheDocument();
  });
  
  it('renders markdown documentation', async () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        name: 'Test Resource',
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Test Markdown',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });
    
    render(
      <DocumentationModal resourceId={1}>
        {(onOpen) => <button onClick={onOpen}>Open Documentation</button>}
      </DocumentationModal>
    );
    
    // Open the modal
    fireEvent.click(screen.getByText('Open Documentation'));
    
    // Check if markdown content is rendered
    await waitFor(() => {
      const markdownContent = screen.getByTestId('markdown-content');
      expect(markdownContent).toBeInTheDocument();
      expect(markdownContent).toHaveTextContent('# Test Markdown');
    });
  });
  
  it('renders URL documentation in an iframe', async () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        name: 'Test Resource',
        documentationType: DocumentationType.URL,
        documentationUrl: 'https://example.com',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });
    
    render(
      <DocumentationModal resourceId={1}>
        {(onOpen) => <button onClick={onOpen}>Open Documentation</button>}
      </DocumentationModal>
    );
    
    // Open the modal
    fireEvent.click(screen.getByText('Open Documentation'));
    
    // Check if iframe is rendered
    await waitFor(() => {
      const iframe = screen.getByTitle('Test Resource Documentation');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://example.com');
    });
  });
  
  it('navigates to edit page when edit button is clicked', async () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        name: 'Test Resource',
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Test Markdown',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });
    
    render(
      <DocumentationModal resourceId={1}>
        {(onOpen) => <button onClick={onOpen}>Open Documentation</button>}
      </DocumentationModal>
    );
    
    // Open the modal
    fireEvent.click(screen.getByText('Open Documentation'));
    
    // Click the edit button
    const editButton = await screen.findByLabelText('actions.edit');
    fireEvent.click(editButton);
    
    // Check if navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/resources/1/documentation/edit');
  });
  
  it('prefetches data when hovering over the button', async () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });
    
    render(
      <DocumentationModal resourceId={1}>
        {(onOpen) => <button onClick={onOpen}>Open Documentation</button>}
      </DocumentationModal>
    );
    
    // Hover over the button
    fireEvent.mouseEnter(screen.getByText('Open Documentation'));
    
    // Check if prefetch was called
    expect(mockPrefetchQuery).toHaveBeenCalled();
  });
});