import React, { useState } from 'react';
import { PageHeader } from '../../components/pageHeader';
import { FabAccessUser, useTranslations } from '@fabaccess/plugins-frontend-ui';
import {
  Card,
  CardBody,
  CardFooter,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { Users, ShieldOffIcon, ShieldCheckIcon } from 'lucide-react';
import { useUsersServiceFindMany } from '@fabaccess/react-query-client';
import { EmptyState } from '../../components/emptyState';
import { TableDataLoadingIndicator } from '../../components/tableComponents';
import { useReactQueryStatusToHeroUiTableLoadingState } from '../../hooks/useReactQueryStatusToHeroUiTableLoadingState';

import * as en from './en.json';
import * as de from './de.json';
import { useDebounce } from '../../hooks/useDebounce';

export const UserManagementPage: React.FC = () => {
  const { t } = useTranslations('userManagementPage', { en, de });

  const [limit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 500);

  const { data: searchResult, status: fetchStatus } = useUsersServiceFindMany({ limit, page, search: debouncedSearch });

  const fetchState = useReactQueryStatusToHeroUiTableLoadingState(fetchStatus);

  return (
    <div data-cy="user-management-page">
      <PageHeader
        title={t('title')}
        subtitle={t('subtitle')}
        backTo="/"
        icon={<Users className="w-6 h-6" />}
        data-cy="user-management-page-header"
      />

      <Card>
        <CardBody>
          <Input
            label={t('table.inputs.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
            isClearable
            onClear={() => setSearch('')}
          />

          <Table removeWrapper>
            <TableHeader>
              <TableColumn width="1" className="hidden md:table-cell">
                {t('table.columns.isEmailVerified')}
              </TableColumn>
              <TableColumn width="1">{t('table.columns.id')}</TableColumn>
              <TableColumn>{t('table.columns.username')}</TableColumn>
              <TableColumn className="hidden md:table-cell">{t('table.columns.externalIdentifier')}</TableColumn>
            </TableHeader>

            <TableBody
              items={searchResult?.data ?? []}
              loadingState={fetchState}
              emptyContent={<EmptyState />}
              loadingContent={<TableDataLoadingIndicator />}
            >
              {(user) => (
                <TableRow key={user.id} href={`/users/${user.id}`} className="cursor-pointer hover:scale-105">
                  <TableCell className="hidden md:table-cell">
                    {user.isEmailVerified ? <ShieldCheckIcon /> : <ShieldOffIcon />}
                  </TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>
                    <FabAccessUser user={user} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.externalIdentifier}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>

        <CardFooter className="flex w-full justify-end">
          <Pagination
            isCompact
            showControls
            page={page}
            total={searchResult?.totalPages ?? 0}
            onChange={(page) => setPage(page)}
          />
        </CardFooter>
      </Card>
    </div>
  );
};
