import {
  useAccessControlServiceResourceGroupIntroducersIsIntroducer,
  useResourcesServiceGetAllResources,
  useResourcesServiceResourceGroupsGetOne,
} from '@attraccess/react-query-client';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardProps,
  Image,
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { PageHeader } from '../../../components/pageHeader';
import { useMemo } from 'react';
import { filenameToUrl } from '../../../api';
import { StatusChip } from './statusChip';
import { ChevronRightIcon, Settings2Icon } from 'lucide-react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';

import en from './en.json';
import de from './de.json';
import { useAuth } from '../../../hooks/useAuth';

interface Props {
  groupId: number | 'none';
  searchValue?: string;
}

export function ResourceGroupCard(props: Readonly<Props & Omit<CardProps, 'children'>>) {
  const { groupId, searchValue, ...cardProps } = props;

  const { t } = useTranslations('resourceGroupCard', { de, en });
  const { hasPermission, user } = useAuth();

  const { data: group, isLoading: isLoadingGroup } = useResourcesServiceResourceGroupsGetOne(
    { id: groupId as number },
    undefined,
    {
      enabled: !!groupId && groupId !== 'none',
    }
  );

  const { data: resources, isLoading: isLoadingResources } = useResourcesServiceGetAllResources(
    { groupId: groupId === 'none' ? -1 : groupId, search: searchValue?.trim() || undefined },
    undefined,
    {
      enabled: !!groupId,
    }
  );

  const isLoading = useMemo(() => isLoadingGroup || isLoadingResources, [isLoadingGroup, isLoadingResources]);

  const canManageResources = hasPermission('canManageResources');

  const { data: introductionStatus } = useAccessControlServiceResourceGroupIntroducersIsIntroducer(
    {
      groupId: groupId as number,
      userId: user?.id as number,
    },
    undefined,
    {
      enabled: !!groupId && !!user?.id && groupId !== 'none',
    }
  );

  const hasAccessToGroupSettings = useMemo(() => {
    return canManageResources || introductionStatus?.isIntroducer;
  }, [introductionStatus, canManageResources]);

  const title = useMemo(() => {
    if (groupId === 'none') {
      return t('ungrouped');
    }

    return group?.name ?? '';
  }, [groupId, group, t]);

  const subtitle = useMemo(() => {
    if (groupId === 'none') {
      return t('ungroupedDescription');
    }

    return group?.description ?? '';
  }, [groupId, group, t]);

  return (
    <Card {...cardProps}>
      <CardHeader className="flex flex-row justify-between">
        <PageHeader title={title} subtitle={subtitle} noMargin />
        {groupId !== 'none' && hasAccessToGroupSettings && (
          <Button as={Link} href={`/resource-groups/${groupId}`} isIconOnly startContent={<Settings2Icon />} />
        )}
      </CardHeader>

      <CardBody>
        <Table shadow="none" removeWrapper>
          <TableHeader>
            <TableColumn width="48">{t('columns.image')}</TableColumn>
            <TableColumn>{t('columns.name')}</TableColumn>
            <TableColumn width="150" className="text-right">
              {t('columns.status')}
            </TableColumn>
            <TableColumn width="4">{''}</TableColumn>
          </TableHeader>
          <TableBody items={resources?.data ?? []} isLoading={isLoading}>
            {(resource) => (
              <TableRow
                key={resource.id}
                as={Link}
                href={`/resources/${resource.id}`}
                className="cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300"
              >
                <TableCell>
                  <Image
                    height={48}
                    width={48}
                    isBlurred
                    src={filenameToUrl(resource.imageFilename)}
                    alt={resource.name}
                  />
                </TableCell>
                <TableCell>{resource.name}</TableCell>
                <TableCell className="text-right">
                  <StatusChip resourceId={resource.id} />
                </TableCell>
                <TableCell>
                  <Button as={Link} href={`/resources/${resource.id}`} isIconOnly startContent={<ChevronRightIcon />} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
