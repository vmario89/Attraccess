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
        <div className="flex justify-center p-4">
          <Spinner size="lg" label={t('loading')} color="primary" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center gap-4 p-4">
          <p className="text-danger">
            {error instanceof Error ? error.message : t('error.unknown')}
          </p>
          <Button 
            color="primary" 
            variant="flat" 
            onPress={() => refetch()}
            startContent={<RefreshCw size={16} />}
          >
            {t('actions.retry')}
          </Button>
        </div>
      );
    }

    if (!resource?.documentationType) {
      return <p className="text-center text-default-400 p-4">{t('noDocumentation')}</p>;
    }

    if (resource.documentationType === DocumentationType.MARKDOWN && resource.documentationMarkdown) {
      return (
        <div className="prose prose-sm md:prose-base max-w-none p-4">
          <ReactMarkdown>{resource.documentationMarkdown}</ReactMarkdown>
        </div>
      );
    }

    if (resource.documentationType === DocumentationType.URL && resource.documentationUrl) {
      return (
        <iframe
          src={resource.documentationUrl}
          className="w-full h-[500px] border-0"
          title={`${resource.name} Documentation`}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      );
    }

    return <p className="text-center text-default-400 p-4">{t('noDocumentation')}</p>;
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
                <div className="flex gap-1">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={handleEditDocumentation}
                    aria-label={t('actions.edit')}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={toggleFullscreen}
                    aria-label={isFullscreen ? t('actions.exitFullscreen') : t('actions.fullscreen')}
                  >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  </Button>
                  {(resource?.documentationType === DocumentationType.URL || 
                   resource?.documentationType === DocumentationType.MARKDOWN) && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      onPress={handleOpenInNewTab}
                      aria-label={t('actions.openInNewTab')}
                    >
                      <ExternalLink size={16} />
                    </Button>
                  )}
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={() => refetch()}
                    isLoading={isFetching}
                    aria-label={t('actions.refresh')}
                  >
                    <RefreshCw size={16} />
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