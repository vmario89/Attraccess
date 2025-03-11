import { useCallback, useMemo, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  Pagination,
  Spinner,
} from '@heroui/react';
import { ResourceUsage } from '@attraccess/api-client';
import { useTranslations } from '../../../../../i18n';
import * as en from './utils/translations/en';
import * as de from './utils/translations/de';
import { generateHeaderColumns } from './utils/tableHeaders';
import { generateRowCells } from './utils/tableRows';
import { useResourceUsageHistory } from '../../../../../api/hooks/resourceUsage';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Select } from '@frontend/components/select';

interface HistoryTableProps {
  resourceId: number;
  showAllUsers?: boolean;
  canManageResources: boolean;
  onSessionClick: (session: ResourceUsage) => void;
}

// Main History Table component
export const HistoryTable = ({
  resourceId,
  showAllUsers = false,
  canManageResources,
  onSessionClick,
}: HistoryTableProps) => {
  const { t } = useTranslations('historyTable', { en, de });

  // Pagination state
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when changing rows per page
  }, []);

  const handleSelectionChange = useCallback(
    (key: string) => {
      handleRowsPerPageChange(Number(key));
    },
    [handleRowsPerPageChange]
  );

  // Data fetching with the hook
  const {
    data: usageHistory,
    isLoading,
    error,
  } = useResourceUsageHistory(resourceId, page, rowsPerPage, showAllUsers);

  // Generate header columns
  const headerColumns = useMemo(
    () => generateHeaderColumns(t, showAllUsers, canManageResources),
    [t, showAllUsers, canManageResources]
  );

  const loadingState = useMemo(() => {
    return isLoading ? 'loading' : 'idle';
  }, [isLoading]);

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        {t('errorLoadingHistory')}
      </div>
    );
  }

  return (
    <Table
      aria-label="Resource usage history"
      shadow="none"
      bottomContent={
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <Select
              selectedKey={rowsPerPage.toString()}
              onSelectionChange={handleSelectionChange}
              items={[5, 10, 25, 50].map((item) => ({
                key: item.toString(),
                label: item.toString(),
              }))}
              label="Rows per page"
            />
          </div>
          <Pagination
            total={usageHistory?.totalPages || 1}
            page={page}
            onChange={handlePageChange}
          />
        </div>
      }
    >
      <TableHeader>{headerColumns}</TableHeader>
      <TableBody
        isLoading={isLoading}
        emptyContent={t('noUsageHistory')}
        loadingContent={<Spinner />}
        loadingState={loadingState}
      >
        {(usageHistory?.data ?? []).map((session: ResourceUsage) => (
          <TableRow
            key={session.id}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => onSessionClick(session)}
          >
            {generateRowCells(session, t, showAllUsers, canManageResources)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
