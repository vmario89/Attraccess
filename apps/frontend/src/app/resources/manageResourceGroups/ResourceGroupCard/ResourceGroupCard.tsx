import { Card, CardBody, Button, Chip, Tooltip } from '@heroui/react';
import { Users, Settings, Trash2, Shield } from 'lucide-react';
import { ResourceGroup } from '@attraccess/react-query-client';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import * as en from './translations/en.json';
import * as de from './translations/de.json';

interface ResourceGroupCardProps {
  group: ResourceGroup;
  onEdit?: (group: ResourceGroup) => void;
  onDelete?: (group: ResourceGroup) => void;
  onRemove?: (group: ResourceGroup) => void;
  showActions?: boolean;
  isRemoving?: boolean;
  variant?: 'default' | 'compact';
}

export function ResourceGroupCard({
  group,
  onEdit,
  onDelete,
  onRemove,
  showActions = true,
  isRemoving = false,
  variant = 'default',
}: Readonly<ResourceGroupCardProps>) {
  const { t } = useTranslations('resourceGroupCard', { en, de });

  const handleEdit = () => {
    onEdit?.(group);
  };

  const handleRemove = () => {
    onRemove?.(group);
  };

  if (variant === 'compact') {
    return (
      <Card shadow="sm" isPressable>
        <CardBody>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={20} />
              <div>
                <h4>{group.name}</h4>
                {group.description && <p style={{ fontSize: '14px', opacity: 0.7 }}>{group.description}</p>}
              </div>
            </div>
            {showActions && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {onEdit && (
                  <Tooltip content={t('editGroup')}>
                    <Button isIconOnly size="sm" variant="light" onPress={handleEdit}>
                      <Settings size={16} />
                    </Button>
                  </Tooltip>
                )}
                {onRemove && (
                  <Tooltip content={t('removeFromResource')}>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      isLoading={isRemoving}
                      onPress={handleRemove}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card shadow="md" isPressable>
      <CardBody>
        <div
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={24} />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{group.name}</h3>
              <div style={{ marginTop: '4px' }}>
                <Chip size="sm" variant="flat" color="primary" startContent={<Shield size={12} />}>
                  {t('resourceGroup')}
                </Chip>
              </div>
            </div>
          </div>
          {showActions && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {onEdit && (
                <Tooltip content={t('editGroup')}>
                  <Button isIconOnly size="sm" variant="light" onPress={handleEdit}>
                    <Settings size={16} />
                  </Button>
                </Tooltip>
              )}
              {onRemove && (
                <Tooltip content={t('removeFromResource')}>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    isLoading={isRemoving}
                    onPress={handleRemove}
                  >
                    <Trash2 size={16} />
                  </Button>
                </Tooltip>
              )}
            </div>
          )}
        </div>

        {group.description && (
          <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '12px' }}>{group.description}</p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            opacity: 0.6,
          }}
        >
          <span>
            {t('groupId')}: {group.id}
          </span>
          {group.createdAt && (
            <span>
              {t('created')}: {new Date(group.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
