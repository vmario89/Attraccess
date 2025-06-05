import { useMemo } from 'react';
import { Card, CardHeader, CardBody, Spinner, Chip } from '@heroui/react';
import { Users, AlertCircle, FileText } from 'lucide-react';
import {
  useResourcesServiceGetOneResourceById,
  useResourcesServiceResourceGroupsRemoveResource,
  UseResourcesServiceGetOneResourceByIdKeyFn,
  UseResourcesServiceGetAllResourcesKeyFn,
  ResourceGroup,
} from '@attraccess/react-query-client';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { useToastMessage } from '../../../../components/toastProvider';
import { useQueryClient } from '@tanstack/react-query';
import { ResourceGroupCard } from '../ResourceGroupCard';
import * as en from './translations/en.json';
import * as de from './translations/de.json';

interface CurrentGroupsProps {
  resourceId: number;
}

export function CurrentGroups({ resourceId }: CurrentGroupsProps) {
  const { t } = useTranslations('currentGroups', { en, de });
  const { success, error: showError } = useToastMessage();
  const queryClient = useQueryClient();

  const { data: resource, isLoading, error } = useResourcesServiceGetOneResourceById({ id: resourceId });

  const { mutateAsync: removeResourceFromGroup, isPending: isRemoving } =
    useResourcesServiceResourceGroupsRemoveResource();

  const currentGroups: ResourceGroup[] = useMemo(() => resource?.groups ?? [], [resource]);

  const handleRemoveGroup = async (group: ResourceGroup) => {
    try {
      await removeResourceFromGroup({ groupId: group.id, resourceId });

      success({
        title: t('removeSuccessTitle'),
        description: t('removeSuccessDescription', { groupName: group.name }),
      });

      // Invalidate queries instead of using callbacks
      queryClient.invalidateQueries({
        queryKey: UseResourcesServiceGetOneResourceByIdKeyFn({ id: resourceId }),
      });
      queryClient.invalidateQueries({
        queryKey: UseResourcesServiceGetAllResourcesKeyFn(),
      });
    } catch (err) {
      console.error('Failed to remove group:', err);
      showError({
        title: t('removeErrorTitle'),
        description: t('removeErrorDescription'),
      });
    }
  };

  if (error) {
    return (
      <Card>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} color="red" />
            <div>
              <p style={{ color: 'red', fontWeight: '500' }}>{t('loadError')}</p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>{t('loadErrorDescription')}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={20} />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{t('title')}</h3>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>{t('subtitle')}</p>
            </div>
          </div>
          {!isLoading && (
            <Chip size="sm" color="primary" variant="flat">
              {t('groupCount', { count: currentGroups.length })}
            </Chip>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
            <Spinner size="sm" />
            <span style={{ marginLeft: '8px', opacity: 0.7 }}>{t('loading')}</span>
          </div>
        ) : currentGroups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: '500', opacity: 0.7 }}>{t('noGroups')}</p>
            <p style={{ fontSize: '14px', opacity: 0.5, marginTop: '4px' }}>{t('noGroupsDescription')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentGroups.map((group) => (
              <ResourceGroupCard
                key={group.id}
                group={group}
                variant="compact"
                onRemove={handleRemoveGroup}
                isRemoving={isRemoving}
                showActions={true}
              />
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
