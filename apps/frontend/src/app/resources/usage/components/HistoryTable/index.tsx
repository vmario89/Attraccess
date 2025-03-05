import React from 'react';
import { Table, TableHeader, TableBody, TableRow } from '@heroui/react';
import { ResourceUsage } from '@attraccess/api-client';
import { useTranslations } from '../../../../../i18n';
import * as en from './utils/translations/en';
import * as de from './utils/translations/de';
import { generateHeaderColumns } from './utils/tableHeaders';
import { generateRowCells } from './utils/tableRows';

interface PaginatedResourceUsage {
  data: ResourceUsage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface HistoryTableProps {
  usageHistory: PaginatedResourceUsage | undefined;
  showAllUsers: boolean;
  canManageResources: boolean;
  onSessionClick: (session: ResourceUsage) => void;
}

// Main History Table component
export const HistoryTable = ({
  usageHistory,
  showAllUsers,
  canManageResources,
  onSessionClick,
}: HistoryTableProps) => {
  const { t } = useTranslations('historyTable', { en, de });

  if (!usageHistory || !usageHistory.data || usageHistory.data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('noUsageHistory')}
      </div>
    );
  }

  // Generate header columns
  const headerColumns = generateHeaderColumns(
    t,
    showAllUsers,
    canManageResources
  );

  return (
    <Table aria-label="Resource usage history">
      <TableHeader>{headerColumns}</TableHeader>
      <TableBody>
        {usageHistory.data.map((session: ResourceUsage) => (
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
