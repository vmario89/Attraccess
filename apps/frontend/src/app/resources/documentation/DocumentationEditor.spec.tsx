import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentationEditor } from './DocumentationEditor';
import { DocumentationType } from '@attraccess/database-entities';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/i18n';
import userEvent from '@testing-library/user-event';

// Mock react-markdown
jest.mock('react-markdown', () => {
  return ({ children }: { children: string }) => <div data-testid="markdown-preview">{children}</div>;
});

describe('DocumentationEditor', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render markdown editor with preview', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocumentationEditor
          initialDocumentationType={DocumentationType.MARKDOWN}
          initialDocumentationMarkdown="# Initial Documentation"
          initialDocumentationUrl=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      </I18nextProvider>
    );

    // Check if markdown editor is rendered
    const markdownEditor = screen.getByLabelText('Markdown content');
    expect(markdownEditor).toBeInTheDocument();
    expect(markdownEditor).toHaveValue('# Initial Documentation');

    // Check if preview is rendered
    expect(screen.getByTestId('markdown-preview')).toHaveTextContent('# Initial Documentation');

    // Update markdown content
    await userEvent.clear(markdownEditor);
    await userEvent.type(markdownEditor, '# Updated Documentation');

    // Check if preview updates
    expect(screen.getByTestId('markdown-preview')).toHaveTextContent('# Updated Documentation');

    // Save changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Check if onSave was called with correct values
    expect(mockOnSave).toHaveBeenCalledWith({
      documentationType: DocumentationType.MARKDOWN,
      documentationMarkdown: '# Updated Documentation',
      documentationUrl: '',
    });
  });

  it('should render URL editor', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocumentationEditor
          initialDocumentationType={DocumentationType.URL}
          initialDocumentationMarkdown=""
          initialDocumentationUrl="https://example.com/docs"
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      </I18nextProvider>
    );

    // Check if URL editor is rendered
    const urlEditor = screen.getByLabelText('Documentation URL');
    expect(urlEditor).toBeInTheDocument();
    expect(urlEditor).toHaveValue('https://example.com/docs');

    // Update URL
    await userEvent.clear(urlEditor);
    await userEvent.type(urlEditor, 'https://example.com/updated-docs');

    // Save changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Check if onSave was called with correct values
    expect(mockOnSave).toHaveBeenCalledWith({
      documentationType: DocumentationType.URL,
      documentationMarkdown: '',
      documentationUrl: 'https://example.com/updated-docs',
    });
  });

  it('should switch between documentation types', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocumentationEditor
          initialDocumentationType={DocumentationType.MARKDOWN}
          initialDocumentationMarkdown="# Initial Documentation"
          initialDocumentationUrl=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      </I18nextProvider>
    );

    // Initially in markdown mode
    expect(screen.getByLabelText('Markdown content')).toBeInTheDocument();

    // Switch to URL mode
    const typeSelect = screen.getByLabelText('Documentation type');
    fireEvent.change(typeSelect, { target: { value: DocumentationType.URL } });

    // Now in URL mode
    expect(screen.getByLabelText('Documentation URL')).toBeInTheDocument();
    expect(screen.queryByLabelText('Markdown content')).not.toBeInTheDocument();

    // Enter URL
    const urlEditor = screen.getByLabelText('Documentation URL');
    await userEvent.type(urlEditor, 'https://example.com/docs');

    // Save changes
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Check if onSave was called with correct values
    expect(mockOnSave).toHaveBeenCalledWith({
      documentationType: DocumentationType.URL,
      documentationMarkdown: '',
      documentationUrl: 'https://example.com/docs',
    });
  });

  it('should disable inputs when loading', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocumentationEditor
          initialDocumentationType={DocumentationType.MARKDOWN}
          initialDocumentationMarkdown="# Initial Documentation"
          initialDocumentationUrl=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      </I18nextProvider>
    );

    // Check if inputs are disabled
    expect(screen.getByLabelText('Documentation type')).toBeDisabled();
    expect(screen.getByLabelText('Markdown content')).toBeDisabled();
    
    // Check if buttons show loading state
    expect(screen.getByText('Save')).toBeDisabled();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocumentationEditor
          initialDocumentationType={DocumentationType.MARKDOWN}
          initialDocumentationMarkdown="# Initial Documentation"
          initialDocumentationUrl=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
        />
      </I18nextProvider>
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});