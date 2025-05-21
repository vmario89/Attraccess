import { memo, useCallback, useState, useEffect } from 'react';
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
import { Edit, ExternalLink, Maximize, Minimize, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  useResourcesServiceGetOneResourceById,
  UseResourcesServiceGetOneResourceByIdKeyFn
} from '@attraccess/react-query-client';
import { DocumentationType } from './types';
import en from './documentationModal.en.json';
import de from './documentationModal.de.json';
import ReactMarkdown from 'react-markdown';
import { useQueryClient } from '@tanstack/react-query';

interface DocumentationModalProps {
  resourceId: number;
  children: (onOpen: () => void) => React.ReactNode;
}

function DocumentationModalComponent({ resourceId, children }: DocumentationModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { t } = useTranslations('documentationModal', {
    en,
    de,
  });

  // Get resource query key for prefetching and cache operations
  const resourceQueryKey = UseResourcesServiceGetOneResourceByIdKeyFn({ id: resourceId });

  const {
    data: resource,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useResourcesServiceGetOneResourceById(
    { id: resourceId },
    {
      // Only fetch when modal is open
      enabled: isOpen
    }
  );

  // Prefetch resource data when hovering over the button that opens the modal
  const handlePrefetch = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: resourceQueryKey,
      queryFn: () => queryClient.fetchQuery({ queryKey: resourceQueryKey })
    });
  }, [queryClient, resourceQueryKey]);

  // When modal opens, ensure we have fresh data
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

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
    if (isLoading || isFetching) {
      return (
        <div className="flex items-center justify-center p-8">
          <Spinner size="lg" color="primary" />
          <span className="ml-2">{t('loading')}</span>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">
            {error instanceof Error ? error.message : t('error.unknown')}
          </div>
          <Button 
            color="primary" 
            variant="light" 
            onPress={() => refetch()}
            startContent={<RefreshCw className="h-4 w-4" />}
          >
            {t('actions.retry')}
          </Button>
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
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      );
    }

    return (
      <div className="p-4 text-center text-gray-500">
        {t('noDocumentation')}
      </div>
    );
  }, [isLoading, isFetching, isError, error, resource, refetch, t]);

  const modalSize = isFullscreen ? 'full' : '5xl';

  return (
    <>
      <div onMouseEnter={handlePrefetch}>
        {children(onOpen)}
      </div>
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
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => refetch()}
                    isLoading={isFetching}
                    aria-label={t('actions.refresh')}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
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