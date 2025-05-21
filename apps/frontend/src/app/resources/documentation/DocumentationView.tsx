import { memo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, Spinner } from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { ArrowLeft, Edit, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../../components/pageHeader';
import { 
  useResourcesServiceGetOneResourceById,
  UseResourcesServiceGetOneResourceByIdKeyFn
} from '@attraccess/react-query-client';
import { DocumentationType } from './types';
import ReactMarkdown from 'react-markdown';
import en from './documentationModal.en.json';
import de from './documentationModal.de.json';
import { useAuth } from '../../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

function DocumentationViewComponent() {
  const { id } = useParams<{ id: string }>();
  const resourceId = parseInt(id || '', 10);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  
  const { t } = useTranslations('documentationModal', {
    en,
    de,
  });

  // Get resource query key for cache operations
  const resourceQueryKey = UseResourcesServiceGetOneResourceByIdKeyFn({ id: resourceId });

  const {
    data: resource,
    isLoading: isLoadingResource,
    isError: isResourceError,
    error: resourceError,
    refetch: refetchResource,
    isFetching,
  } = useResourcesServiceGetOneResourceById({ id: resourceId });

  const handleEditDocumentation = useCallback(() => {
    navigate(`/resources/${resourceId}/documentation/edit`);
  }, [navigate, resourceId]);

  const canManageResources = hasPermission('canManageResources');

  // Handle loading state
  if (isLoadingResource) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // Handle error state
  if (isResourceError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading resource</h2>
          <p className="text-gray-500 mb-4">
            {resourceError instanceof Error ? resourceError.message : 'An unknown error occurred'}
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              onPress={() => refetchResource()} 
              color="primary"
              startContent={<RefreshCw className="h-4 w-4" />}
            >
              Try Again
            </Button>
            <Button 
              onPress={() => navigate('/resources')} 
              variant="light" 
              startContent={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Resources
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle not found state
  if (!resource) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Resource not found</h2>
          <p className="text-gray-500 mb-4">The requested resource could not be found.</p>
          <Button onPress={() => navigate('/resources')} variant="light" startContent={<ArrowLeft className="w-4 h-4" />}>
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title={t('title')}
        subtitle={resource.name}
        backTo={`/resources/${resourceId}`}
        actions={
          <div className="flex space-x-2">
            {canManageResources && (
              <Button
                color="primary"
                variant="light"
                onPress={handleEditDocumentation}
                startContent={<Edit className="h-4 w-4" />}
              >
                {t('actions.edit')}
              </Button>
            )}
            <Button
              variant="light"
              onPress={() => refetchResource()}
              isLoading={isFetching}
              startContent={<RefreshCw className="h-4 w-4" />}
              aria-label={t('actions.refresh')}
            >
              {t('actions.refresh')}
            </Button>
          </div>
        }
      />

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">{resource.name}</h2>
        </CardHeader>
        <CardBody>
          {isFetching && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Spinner size="lg" color="primary" />
            </div>
          )}
          
          {!resource.documentationType && (
            <div className="p-4 text-center text-gray-500">
              {t('noDocumentation')}
            </div>
          )}

          {resource.documentationType === DocumentationType.MARKDOWN && resource.documentationMarkdown && (
            <div className="prose prose-sm md:prose-base lg:prose-lg max-w-none">
              <ReactMarkdown>{resource.documentationMarkdown}</ReactMarkdown>
            </div>
          )}

          {resource.documentationType === DocumentationType.URL && resource.documentationUrl && (
            <iframe
              src={resource.documentationUrl}
              className="w-full border-0"
              style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}
              title={`${resource.name} Documentation`}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export const DocumentationView = memo(DocumentationViewComponent);