import { useParams, useNavigate } from 'react-router-dom';
import { useResource, useDeleteResource } from '../../api/hooks/resources';
import { useAuth } from '../../hooks/useAuth';
import { useToastMessage } from '../../components/toastProvider';
import { ArrowLeft, Trash } from 'lucide-react';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/react';
import { useDisclosure } from '@heroui/modal';
import { ResourceUsageSession } from './usage/resourceUsageSession';
import { ResourceUsageHistory } from './usage/resourceUsageHistory';
import { PageHeader } from '../../components/pageHeader';
import { DeleteConfirmationModal } from '../../components/deleteConfirmationModal';
import { useTranslations } from '../../i18n';
import * as en from './translations/resourceDetails.en';
import * as de from './translations/resourceDetails.de';
import { ResourceIntroductions } from './introductions/resourceIntroductions';
import { ManageIntroducers } from './introductions/components/ManageIntroducers';
import { memo, useMemo } from 'react';
import {
  useCanManageIntroductions,
  useCanManageIntroducers,
} from '../../api/hooks/resourceIntroduction';

function ResourceDetailsComponent() {
  const { id } = useParams<{ id: string }>();
  const resourceId = parseInt(id || '', 10);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { hasPermission } = useAuth();
  const { success, error: showError } = useToastMessage();
  const navigate = useNavigate();

  const { t } = useTranslations('resourceDetails', {
    en,
    de,
  });

  const {
    data: resource,
    isLoading: isLoadingResource,
    error: resourceError,
  } = useResource(resourceId);

  const deleteResource = useDeleteResource();

  const handleDelete = async () => {
    try {
      await deleteResource.mutateAsync(resourceId);
      success({
        title: 'Resource deleted',
        description: `${resource?.name} has been successfully deleted`,
      });
      navigate('/resources');
    } catch (err) {
      showError({
        title: 'Failed to delete resource',
        description:
          'An error occurred while deleting the resource. Please try again.',
      });
      console.error('Failed to delete resource:', err);
      throw err;
    }
  };

  const canManageResources = hasPermission('canManageResources');
  const { data: canManageIntroductions } =
    useCanManageIntroductions(resourceId);
  const { data: canManageIntroducers } = useCanManageIntroducers(resourceId);

  const showIntroductionsManagement = useMemo(
    () => canManageResources || canManageIntroductions,
    [canManageResources, canManageIntroductions]
  );

  const showIntroducersManagement = useMemo(
    () => canManageResources || canManageIntroducers,
    [canManageResources, canManageIntroducers]
  );

  if (isLoadingResource) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (resourceError || !resource) {
    return (
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-2">Resource not found</h2>
        <p className="text-gray-500 mb-4">
          The requested resource could not be found or you don't have permission
          to view it.
        </p>
        <Button
          onPress={() => navigate('/resources')}
          variant="light"
          startContent={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Resources
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen">
      <PageHeader
        title={resource.name}
        subtitle={resource.description || undefined}
        backTo="/resources"
        actions={
          canManageResources && (
            <Button
              onPress={onOpen}
              color="danger"
              variant="light"
              startContent={<Trash className="w-4 h-4" />}
            >
              {t('delete')}
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(showIntroducersManagement || showIntroductionsManagement) && (
          <div className="lg:col-span-1 space-y-6 order-1 lg:order-1">
            {showIntroductionsManagement && (
              <ResourceIntroductions resourceId={resourceId} />
            )}

            {showIntroducersManagement && (
              <ManageIntroducers resourceId={resourceId} />
            )}
          </div>
        )}

        {/* Usage Session */}
        <div
          className={
            'space-y-6 order-first lg:order-2 ' +
            `${
              showIntroducersManagement || showIntroductionsManagement
                ? 'lg:col-span-2'
                : 'lg:col-span-3'
            }`
          }
        >
          <ResourceUsageSession resourceId={resourceId} />
          <ResourceUsageHistory resourceId={resourceId} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={() => onOpenChange()}
        onConfirm={handleDelete}
        itemName={resource.name}
      />
    </div>
  );
}

export const ResourceDetails = memo(ResourceDetailsComponent);
