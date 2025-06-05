import { useCallback, useMemo } from 'react';
import {
  ResourceGroup,
  useResourcesServiceGetOneResourceById,
  UseResourcesServiceGetOneResourceByIdKeyFn,
  useResourcesServiceResourceGroupsAddResource,
  useResourcesServiceResourceGroupsGetMany,
  useResourcesServiceResourceGroupsRemoveResource,
} from '@attraccess/react-query-client';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';

import * as en from './en.json';
import * as de from './de.json';
import { GroupIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/pageHeader';

interface ManageResourceGroupsProps {
  resourceId: number;
}

export function ManageResourceGroups({ resourceId }: Readonly<ManageResourceGroupsProps>) {
  const { t } = useTranslations('manageResourceGroups', { de, en });
  const queryClient = useQueryClient();

  const { data: resource } = useResourcesServiceGetOneResourceById({ id: resourceId });

  const { data: groups, isLoading: isLoadingGroups } = useResourcesServiceResourceGroupsGetMany();

  const { mutate: addResourceToGroup, isPending: isAdding } = useResourcesServiceResourceGroupsAddResource({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UseResourcesServiceGetOneResourceByIdKeyFn({ id: resourceId }) });
    },
  });

  const { mutate: removeResourceFromGroup, isPending: isRemoving } = useResourcesServiceResourceGroupsRemoveResource({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UseResourcesServiceGetOneResourceByIdKeyFn({ id: resourceId }) });
    },
  });

  const isAdded = useCallback(
    (group: ResourceGroup) => {
      return resource?.groups.some((g) => g.id === group.id);
    },
    [resource?.groups]
  );

  const handleGroupClick = useCallback(
    (group: ResourceGroup) => {
      if (!isAdded(group)) {
        addResourceToGroup({
          groupId: group.id,
          resourceId,
        });
      } else {
        removeResourceFromGroup({
          groupId: group.id,
          resourceId,
        });
      }
    },
    [addResourceToGroup, removeResourceFromGroup, resourceId, isAdded]
  );

  const groupsWithResource = useMemo(() => {
    if (!groups) {
      return [];
    }

    return groups?.map((group) => ({
      ...group,
      resource: isAdded(group) ? resource : null,
    }));
  }, [groups, resource, isAdded]);

  return (
    <Card>
      <CardHeader>
        <PageHeader title={t('title')} subtitle={t('subtitle')} icon={<GroupIcon />} noMargin />
      </CardHeader>
      <CardBody>
        <Table shadow="none" removeWrapper>
          <TableHeader>
            <TableColumn>{t('columns.group')}</TableColumn>
            <TableColumn>{t('columns.actions')}</TableColumn>
          </TableHeader>
          <TableBody items={groupsWithResource} isLoading={isLoadingGroups}>
            {(group) => (
              <TableRow key={group.id}>
                <TableCell className="w-full">{group.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    isIconOnly
                    isLoading={isAdding ?? isRemoving}
                    onPress={() => {
                      handleGroupClick(group);
                    }}
                    color={isAdded(group) ? 'danger' : 'primary'}
                    startContent={
                      isAdded(group) ? <Trash2Icon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />
                    }
                  ></Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
