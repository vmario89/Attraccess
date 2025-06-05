import { useState, useMemo } from 'react';
import { Input, Button, Card, CardHeader, CardBody, Divider, Spinner, Chip } from '@heroui/react';
import { Search, Plus, AlertCircle, Users } from 'lucide-react';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
  useResourcesServiceResourceGroupsGetMany,
  useResourcesServiceResourceGroupsAddResource,
  UseResourcesServiceResourceGroupsGetManyKeyFn,
  ResourceGroup,
} from '@attraccess/react-query-client';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { useToastMessage } from '../../../../components/toastProvider';
import { useQueryClient } from '@tanstack/react-query';
import * as en from './translations/en.json';
import * as de from './translations/de.json';

interface GroupSearchProps {
  resourceId: number;
  excludeGroupIds?: Set<number>;
}

export function GroupSearch({ resourceId, excludeGroupIds = new Set() }: Readonly<GroupSearchProps>) {
  const { t } = useTranslations('groupSearch', { en, de });
  const { success, error: showErrorToast } = useToastMessage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: allGroups, isLoading, error: searchError } = useResourcesServiceResourceGroupsGetMany();

  const { mutateAsync: addResourceToGroup, isPending: isAdding } = useResourcesServiceResourceGroupsAddResource();

  const searchResults = useMemo(() => {
    if (!allGroups) return [];

    // Filter client-side by search term and exclude current resource groups
    return allGroups.filter((group) => {
      const matchesSearch =
        (!debouncedSearchTerm || group.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ??
        group.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      return matchesSearch && !excludeGroupIds.has(group.id);
    });
  }, [allGroups, debouncedSearchTerm, excludeGroupIds]);

  const handleAddGroup = async (group: ResourceGroup) => {
    try {
      await addResourceToGroup({ groupId: group.id, resourceId });

      success({
        title: t('addSuccessTitle'),
        description: t('addSuccessDescription', { groupName: group.name }),
      });

      // Invalidate queries properly
      queryClient.invalidateQueries({
        queryKey: UseResourcesServiceResourceGroupsGetManyKeyFn(),
      });

      setSearchTerm('');
    } catch (err) {
      console.error('Failed to add group:', err);
      showErrorToast({
        title: t('addErrorTitle'),
        description: t('addErrorDescription'),
      });
    }
  };

  const hasResults = searchResults.length > 0;
  const showNoResults = debouncedSearchTerm.length > 0 && !isLoading && !hasResults && !searchError;
  const showErrorState = searchError && debouncedSearchTerm.length > 0;

  return (
    <Card>
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={20} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{t('title')}</h3>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>{t('subtitle')}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onValueChange={setSearchTerm}
          startContent={<Search size={16} />}
        />

        {isLoading && debouncedSearchTerm ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
            <Spinner size="sm" />
            <span style={{ marginLeft: '8px', opacity: 0.7 }}>{t('searching')}</span>
          </div>
        ) : null}

        {showErrorState ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              borderRadius: '8px',
            }}
          >
            <AlertCircle size={20} color="red" />
            <p style={{ color: 'red', fontSize: '14px' }}>{t('searchError')}</p>
          </div>
        ) : null}

        {showNoResults ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Users size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ opacity: 0.7 }}>{t('noResults')}</p>
            <p style={{ fontSize: '14px', opacity: 0.5, marginTop: '4px' }}>{t('tryDifferentSearch')}</p>
          </div>
        ) : null}

        {hasResults && !isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', opacity: 0.8 }}>
                {t('searchResultsCount', { count: searchResults.length })}
              </span>
              <Chip size="sm" color="primary" variant="flat">
                {t('availableToAdd')}
              </Chip>
            </div>

            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}
            >
              {searchResults.map((group, index) => (
                <div key={group.id}>
                  <Card shadow="sm" isPressable>
                    <CardBody>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <Users size={20} />
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: '500' }}>{group.name}</h4>
                            {group.description && <p style={{ fontSize: '14px', opacity: 0.7 }}>{group.description}</p>}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<Plus size={16} />}
                          onPress={() => handleAddGroup(group)}
                          isLoading={isAdding}
                        >
                          {t('addButton')}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                  {index < searchResults.length - 1 && <Divider />}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
