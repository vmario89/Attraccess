import { memo, useCallback, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { Edit, ExternalLink, Maximize, Minimize } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResourcesServiceGetOneResourceById } from '@attraccess/react-query-client';
import { DocumentationType } from './types';
import en from './documentationModal.en.json';
import de from './documentationModal.de.json';
import ReactMarkdown from 'react-markdown';

interface DocumentationModalProps {
  resourceId: number;
  children: (onOpen: () => void) => React.ReactNode;
}

function DocumentationModalComponent({ resourceId, children }: DocumentationModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  const { t } = useTranslations('documentationModal', {
    en,
    de,
  });

  const {
    data: resource,
    isLoading,
  } = useResourcesServiceGetOneResourceById({ id: resourceId });

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleEditDocumentation = useCallback(() => {
    navigate(`/resources/${resourceId}/documentation/edit`);
  }, [navigate, resourceId]);

  const handleOpenInNewTab = useCallback(() => {
    if (resource?.documentationType === DocumentationType.URL && resource?.documentationUrl) {
      window.open(resource.documentationUrl, '_blank');
    } else if (resource?.documentationType === DocumentationType.MARKDOWN) {
      window.open(`/resources/${resourceId}/documentation`, '_blank');
    }
  }, [resource, resourceId]);

  const renderDocumentationContent = useCallback(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Spinner size="lg" color="primary" />
          <span className="ml-2">{t('loading')}</span>
        </div>
      );
    }

    if (!resource?.documentationType) {
      return (
        <div className="p-4 text-center text-gray-500">
          {t('noDocumentation')}
        </div>
      );
    }

    if (resource.documentationType === DocumentationType.MARKDOWN && resource.documentationMarkdown) {
      return (
        <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none p-4">
          <ReactMarkdown>{resource.documentationMarkdown}</ReactMarkdown>
        </div>
      );
    }

    if (resource.documentationType === DocumentationType.URL && resource.documentationUrl) {
      return (
        <iframe
          src={resource.documentationUrl}
          className="w-full h-full border-0"
          style={{ minHeight: '500px' }}
          title={`${resource.name} Documentation`}
        />
      );
    }

    return (
      <div className="p-4 text-center text-gray-500">
        {t('noDocumentation')}
      </div>
    );
  }, [isLoading, resource, t]);

  const modalSize = isFullscreen ? 'full' : '5xl';

  return (
    <>
      {children(onOpen)}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        size={modalSize}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex justify-between items-center">
                <div>{t('title')}</div>
                <div className="flex space-x-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={handleEditDocumentation}
                    aria-label={t('actions.edit')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={toggleFullscreen}
                    aria-label={isFullscreen ? t('actions.exitFullscreen') : t('actions.fullscreen')}
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                  {(resource?.documentationType === DocumentationType.URL || 
                   resource?.documentationType === DocumentationType.MARKDOWN) && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={handleOpenInNewTab}
                      aria-label={t('actions.openInNewTab')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </ModalHeader>
              <ModalBody>
                {renderDocumentationContent()}
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  {t('actions.close')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export const DocumentationModal = memo(DocumentationModalComponent);