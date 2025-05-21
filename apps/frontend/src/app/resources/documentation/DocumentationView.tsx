import { memo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, Spinner } from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { ArrowLeft, Edit } from 'lucide-react';
import { PageHeader } from '../../../components/pageHeader';
import { useResourcesServiceGetOneResourceById } from '@attraccess/react-query-client';
import { DocumentationType } from './types';
import ReactMarkdown from 'react-markdown';
import en from './documentationModal.en.json';
import de from './documentationModal.de.json';
import { useAuth } from '../../../hooks/useAuth';

function DocumentationViewComponent() {
  const { id } = useParams<{ id: string }>();
  const resourceId = parseInt(id || '', 10);
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const { t } = useTranslations('documentationModal', {
    en,
    de,
  });

  const {
    data: resource,
    isLoading: isLoadingResource,
  } = useResourcesServiceGetOneResourceById({ id: resourceId });

  const handleEditDocumentation = useCallback(() => {
    navigate(`/resources/${resourceId}/documentation/edit`);
  }, [navigate, resourceId]);

  const canManageResources = hasPermission('canManageResources');

  if (isLoadingResource) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

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
          canManageResources && (
            <Button
              color="primary"
              variant="light"
              onPress={handleEditDocumentation}
              startContent={<Edit className="w-4 h-4" />}
            >
              {t('actions.edit')}
            </Button>
          )
        }
      />

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">{resource.name}</h2>
        </CardHeader>
        <CardBody>
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
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export const DocumentationView = memo(DocumentationViewComponent);