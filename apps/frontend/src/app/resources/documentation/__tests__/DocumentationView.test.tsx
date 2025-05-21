import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentationView } from '../DocumentationView';
import { useResourcesServiceGetOneResourceById } from '@attraccess/react-query-client';
import { useNavigate, useParams } from 'react-router-dom';
import { DocumentationType } from '../types';

// Mock react-markdown
jest.mock('react-markdown', () => require('./mocks/react-markdown').default);

// Mock the dependencies
jest.mock('@attraccess/react-query-client', () => ({
  useResourcesServiceGetOneResourceById: jest.fn(),
  UseResourcesServiceGetOneResourceByIdKeyFn: jest.fn().mockReturnValue(['ResourcesService', 'getOneResourceById', { id: '1' }]),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@attraccess/plugins-frontend-ui', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

describe('DocumentationView', () => {
  const mockNavigate = jest.fn();
  const mockRefetch = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
  });
  
  it('renders loading state when fetching resource', () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: mockRefetch,
      isFetching: false,
    });
    
    render(<DocumentationView />);
    
    expect(screen.getByText('loading')).toBeInTheDocument();
  });
  
  it('renders error state when there is an error fetching resource', () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Test error'),
      refetch: mockRefetch,
      isFetching: false,
    });
    
    render(<DocumentationView />);
    
    expect(screen.getByText('error.fetchFailed')).toBeInTheDocument();
    expect(screen.getByText('actions.retry')).toBeInTheDocument();
  });
  
  it('renders no documentation message when resource has no documentation', () => {
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
    
    render(<DocumentationView />);
    
    expect(screen.getByText('noDocumentation')).toBeInTheDocument();
  });
  
  it('renders markdown documentation', () => {
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
    
    render(<DocumentationView />);
    
    const markdownContent = screen.getByTestId('markdown-content');
    expect(markdownContent).toBeInTheDocument();
    expect(markdownContent).toHaveTextContent('# Test Markdown');
  });
  
  it('renders URL documentation in an iframe', () => {
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
    
    render(<DocumentationView />);
    
    const iframe = screen.getByTitle('Test Resource Documentation');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://example.com');
  });
  
  it('navigates to edit page when edit button is clicked', () => {
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
    
    render(<DocumentationView />);
    
    // Click the edit button
    fireEvent.click(screen.getByText('actions.edit'));
    
    // Check if navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/resources/1/documentation/edit');
  });
  
  it('navigates back when back button is clicked', () => {
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
    
    render(<DocumentationView />);
    
    // Click the back button
    fireEvent.click(screen.getByText('actions.back'));
    
    // Check if navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/resources/1');
  });
  
  it('refreshes data when refresh button is clicked', () => {
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
    
    render(<DocumentationView />);
    
    // Click the refresh button
    fireEvent.click(screen.getByLabelText('actions.refresh'));
    
    // Check if refetch was called
    expect(mockRefetch).toHaveBeenCalled();
  });
});