import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentationEditor } from '../DocumentationEditor';
import { useResourcesServiceGetOneResourceById, useResourcesServiceUpdateOneResource } from '@attraccess/react-query-client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { DocumentationType } from '../types';

// Mock react-markdown
jest.mock('react-markdown', () => require('./mocks/react-markdown').default);

// Mock the dependencies
jest.mock('@attraccess/react-query-client', () => ({
  useResourcesServiceGetOneResourceById: jest.fn(),
  useResourcesServiceUpdateOneResource: jest.fn(),
  UseResourcesServiceGetOneResourceByIdKeyFn: jest.fn().mockReturnValue(['ResourcesService', 'getOneResourceById', { id: '1' }]),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@attraccess/plugins-frontend-ui', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
  useNotifications: () => ({
    success: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('DocumentationEditor', () => {
  const mockNavigate = jest.fn();
  const mockInvalidateQueries = jest.fn();
  const mockMutate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    
    (useResourcesServiceUpdateOneResource as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
  });
  
  it('renders loading state when fetching resource', () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    
    render(<DocumentationEditor />);
    
    expect(screen.getByText('loading')).toBeInTheDocument();
  });
  
  it('renders error state when there is an error fetching resource', () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Test error'),
      refetch: jest.fn(),
    });
    
    render(<DocumentationEditor />);
    
    expect(screen.getByText('error.fetchFailed')).toBeInTheDocument();
  });
  
  it('renders form with markdown editor when resource has markdown documentation', () => {
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
      refetch: jest.fn(),
    });
    
    render(<DocumentationEditor />);
    
    // Check if form elements are rendered
    expect(screen.getByText('documentationType.label')).toBeInTheDocument();
    expect(screen.getByText('documentationType.options.markdown')).toBeInTheDocument();
    expect(screen.getByText('documentationType.options.url')).toBeInTheDocument();
    
    // Check if markdown editor is shown
    expect(screen.getByLabelText('markdownContent.label')).toBeInTheDocument();
    expect(screen.getByDisplayValue('# Test Markdown')).toBeInTheDocument();
  });
  
  it('renders form with URL input when resource has URL documentation', () => {
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
      refetch: jest.fn(),
    });
    
    render(<DocumentationEditor />);
    
    // Check if form elements are rendered
    expect(screen.getByText('documentationType.label')).toBeInTheDocument();
    
    // Check if URL input is shown
    expect(screen.getByLabelText('urlContent.label')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
  });
  
  it('allows switching between documentation types', () => {
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
      refetch: jest.fn(),
    });
    
    render(<DocumentationEditor />);
    
    // Initially shows markdown editor
    expect(screen.getByLabelText('markdownContent.label')).toBeInTheDocument();
    
    // Switch to URL type
    fireEvent.click(screen.getByText('documentationType.options.url'));
    
    // Now shows URL input
    expect(screen.getByLabelText('urlContent.label')).toBeInTheDocument();
  });
  
  it('validates form before submission', async () => {
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
      refetch: jest.fn(),
    });
    
    render(<DocumentationEditor />);
    
    // Clear the URL field
    const urlInput = screen.getByLabelText('urlContent.label');
    fireEvent.change(urlInput, { target: { value: '' } });
    
    // Try to save
    fireEvent.click(screen.getByText('actions.save'));
    
    // Check if validation error is shown
    expect(screen.getByText('validation.urlRequired')).toBeInTheDocument();
    
    // Verify that mutate was not called
    expect(mockMutate).not.toHaveBeenCalled();
  });
  
  it('submits form with valid data', async () => {
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
      refetch: jest.fn(),
    });
    
    render(<DocumentationEditor />);
    
    // Update the URL field
    const urlInput = screen.getByLabelText('urlContent.label');
    fireEvent.change(urlInput, { target: { value: 'https://updated-example.com' } });
    
    // Save the form
    fireEvent.click(screen.getByText('actions.save'));
    
    // Verify that mutate was called with correct data
    expect(mockMutate).toHaveBeenCalledWith({
      id: '1',
      formData: {
        documentationType: DocumentationType.URL,
        documentationMarkdown: null,
        documentationUrl: 'https://updated-example.com',
      },
    });
  });
  
  it('navigates back when cancel button is clicked', () => {
    (useResourcesServiceGetOneResourceById as jest.Mock).mockReturnValue({
      data: {
        id: 1,
        name: 'Test Resource',
        documentationType: null,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    
    render(<DocumentationEditor />);
    
    // Click cancel button
    fireEvent.click(screen.getByText('actions.cancel'));
    
    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/resources/1');
  });
});