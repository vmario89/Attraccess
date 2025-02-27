import { useParams, useNavigate } from 'react-router-dom';
import { useResource, useDeleteResource } from '../../api/hooks/resources';
import { useAuth } from '../../hooks/useAuth';
import { useToastMessage } from '../../components/toastProvider';
import { ArrowLeft, Trash } from 'lucide-react';
import { Button } from '@heroui/button';
import { Spinner } from '@heroui/react';
import { useDisclosure } from '@heroui/modal';
import { ResourceCard } from './resourceCard';
import { ResourceUsageSession } from './resourceUsageSession';
import { ResourceUsageHistory } from './resourceUsageHistory';
import { PageHeader } from '../../components/pageHeader';
import { DeleteConfirmationModal } from '../../components/deleteConfirmationModal';
import { useTranslations } from '../../i18n';
import * as en from './translations/resourceDetails.en';
import * as de from './translations/resourceDetails.de';
import { useResourceIntroducers } from '../../api/hooks/resourceIntroduction';
import { ResourceIntroductions } from './resourceIntroductions';

export function ResourceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resourceId = parseInt(id || '', 10);
  const { success, error: showError } = useToastMessage();
  const { hasPermission, user } = useAuth();
  const canManageResources = hasPermission('canManageResources');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { t } = useTranslations('resourceDetails', {
    en,
    de,
  });

  const {
    data: resource,
    isLoading: isLoadingResource,
    error: resourceError,
  } = useResource(resourceId);

  // Check if the current user can give introductions
  const { data: introducers } = useResourceIntroducers(resourceId);
  const canGiveIntroductions = !!introducers?.some(
    (introducer) => introducer.userId === user?.id
  );

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
        {/* Resource Info */}
        <div className="lg:col-span-1 space-y-6">
          <ResourceCard resource={resource} />

          {/* Only show introductions section to users who can give introductions */}
          {canGiveIntroductions && (
            <ResourceIntroductions resourceId={resourceId} />
          )}
        </div>

        {/* Usage Session */}
        <div className="lg:col-span-2 space-y-6">
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
