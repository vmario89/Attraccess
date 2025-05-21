import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentationModal } from './DocumentationModal';
import { DocumentationType } from '@attraccess/database-entities';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n/i18n';

// Mock react-markdown
jest.mock('react-markdown', () => {
  return ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>;
});

describe('DocumentationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnOpenInNewTab = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render markdown documentation', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocumentationModal
          isOpen={true}
          onClose={mockOnClose}
          onOpenInNewTab={mockOnOpenInNewTab}
          resourceName="Test Resource"
          documentationType={DocumentationType.MARKDOWN}
          documentationMarkdown="# Test Documentation\n\nThis is a test documentation."
        />
      </I18nextProvider>
    );

    expect(screen.getByText('Test Resource')).toBeInTheDocument();
    expect(screen.getByTestId('markdown')).toHaveTextContent('# Test Documentation');
    expect(screen.getByTestId('markdown')).toHaveTextContent('This is a test documentation.');
  });

  it('should render URL documentation in iframe', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocumentationModal
          isOpen={true}
          onClose={mockOnClose}
          onOpenInNewTab={mockOnOpenInNewTab}
          resourceName="Test Resource"
          documentationType={DocumentationType.URL}
          documentationUrl="https://example.com/docs"
        />
      </I18nextProvider>
    );

    expect(screen.getByText('Test Resource')).toBeInTheDocument();
    const iframe = screen.getByTitle('documentation-iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://example.com/docs');
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocumentationModal
          isOpen={true}
          onClose={mockOnClose}
          onOpenInNewTab={mockOnOpenInNewTab}
          resourceName="Test Resource"
          documentationType={DocumentationType.MARKDOWN}
          documentationMarkdown="# Test Documentation"
        />
      </I18nextProvider>
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onOpenInNewTab when open in new tab button is clicked', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocumentationModal
          isOpen={true}
          onClose={mockOnClose}
          onOpenInNewTab={mockOnOpenInNewTab}
          resourceName="Test Resource"
          documentationType={DocumentationType.MARKDOWN}
          documentationMarkdown="# Test Documentation"
        />
      </I18nextProvider>
    );

    const openInNewTabButton = screen.getByLabelText('Open in new tab');
    fireEvent.click(openInNewTabButton);
    expect(mockOnOpenInNewTab).toHaveBeenCalledTimes(1);
  });

  it('should toggle fullscreen mode when fullscreen button is clicked', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocumentationModal
          isOpen={true}
          onClose={mockOnClose}
          onOpenInNewTab={mockOnOpenInNewTab}
          resourceName="Test Resource"
          documentationType={DocumentationType.MARKDOWN}
          documentationMarkdown="# Test Documentation"
        />
      </I18nextProvider>
    );

    const fullscreenButton = screen.getByLabelText('Toggle fullscreen');
    
    // Initial state should not be fullscreen
    expect(screen.getByRole('dialog')).not.toHaveClass('fullscreen');
    
    // Click to enter fullscreen
    fireEvent.click(fullscreenButton);
    expect(screen.getByRole('dialog')).toHaveClass('fullscreen');
    
    // Click again to exit fullscreen
    fireEvent.click(fullscreenButton);
    expect(screen.getByRole('dialog')).not.toHaveClass('fullscreen');
  });

  it('should not render when isOpen is false', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <DocumentationModal
          isOpen={false}
          onClose={mockOnClose}
          onOpenInNewTab={mockOnOpenInNewTab}
          resourceName="Test Resource"
          documentationType={DocumentationType.MARKDOWN}
          documentationMarkdown="# Test Documentation"
        />
      </I18nextProvider>
    );

    expect(screen.queryByText('Test Resource')).not.toBeInTheDocument();
  });
});