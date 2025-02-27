import { useState, ReactElement } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Checkbox,
  Chip,
  User as UserDisplay,
} from '@heroui/react';
import { History, Users } from 'lucide-react';
import { useResourceUsageHistory } from '../../api/hooks/resourceUsage';
import { useAuth } from '../../hooks/useAuth';
import { useTranslations } from '../../i18n';
import * as en from './translations/resourceUsageHistory.en';
import * as de from './translations/resourceUsageHistory.de';
import { ResourceUsage } from '@attraccess/api-client';

interface ResourceUsageHistoryProps {
  resourceId: number;
}

interface PaginatedResourceUsage {
  data: ResourceUsage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function ResourceUsageHistory({
  resourceId,
}: ResourceUsageHistoryProps) {
  const { t } = useTranslations('resourceUsageHistory', { en, de });
  const { hasPermission } = useAuth();
  const canManageResources = hasPermission('canManageResources');

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const {
    data: usageHistory,
    isLoading,
    error,
  } = useResourceUsageHistory(resourceId, page, rowsPerPage, showAllUsers);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatDuration = (hours: number) => {
    const totalMinutes = Math.round(hours * 60);
    const displayHours = Math.floor(totalMinutes / 60);
    const displayMinutes = totalMinutes % 60;

    return `${displayHours}h ${displayMinutes}m`;
  };

  // Cast the response to the correct type
  const typedUsageHistory = usageHistory as PaginatedResourceUsage | undefined;

  // Prepare the column headers
  const renderTableHeaders = (): ReactElement[] => {
    const headers: ReactElement[] = [];

    // Only show user column if we're showing all users (requires canManageResources)
    if (canManageResources && showAllUsers) {
      headers.push(<TableColumn key="user">{t('user')}</TableColumn>);
    }

    headers.push(
      <TableColumn key="startTime">{t('startTime')}</TableColumn>,
      <TableColumn key="endTime">{t('endTime')}</TableColumn>,
      <TableColumn key="duration">{t('duration')}</TableColumn>,
      <TableColumn key="status">{t('status')}</TableColumn>
    );

    return headers;
  };

  // Prepare cells for a session row
  const renderSessionCells = (session: ResourceUsage): ReactElement[] => {
    const cells: ReactElement[] = [];

    // Only show user cell if we're showing all users (requires canManageResources)
    if (canManageResources && showAllUsers) {
      cells.push(
        <TableCell key={`user-${session.id}`}>
          <UserDisplay
            name={session.user?.username || t('unknownUser')}
            description={`ID: ${session.user?.username}`}
            avatarProps={{
              name: session.user?.username?.charAt(0) || '?',
              color: 'primary',
            }}
          />
        </TableCell>
      );
    }

    cells.push(
      <TableCell key={`start-${session.id}`}>
        {new Date(session.startTime).toLocaleString()}
      </TableCell>,
      <TableCell key={`end-${session.id}`}>
        {session.endTime ? new Date(session.endTime).toLocaleString() : '—'}
      </TableCell>,
      <TableCell key={`duration-${session.id}`}>
        {session.duration > 0
          ? formatDuration(session.duration)
          : t('inProgress')}
      </TableCell>,
      <TableCell key={`status-${session.id}`}>
        {!session.endTime ? (
          <Chip color="primary" variant="flat">
            {t('active')}
          </Chip>
        ) : (
          <Chip color="success" variant="flat">
            {t('completed')}
          </Chip>
        )}
      </TableCell>
    );

    return cells;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('usageHistory')}
            </h3>
          </div>
          {canManageResources && (
            <div className="flex items-center">
              <Checkbox
                isSelected={showAllUsers}
                onValueChange={setShowAllUsers}
                size="sm"
              />
              <span className="ml-2 text-sm flex items-center">
                <Users className="w-4 h-4 mr-1" /> {t('showAllUsers')}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size="md" color="primary" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            {t('errorLoadingHistory')}
          </div>
        ) : !typedUsageHistory ||
          !typedUsageHistory.data ||
          typedUsageHistory.data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('noUsageHistory')}
          </div>
        ) : (
          <>
            <Table aria-label="Resource usage history">
              <TableHeader>{renderTableHeaders()}</TableHeader>
              <TableBody>
                {typedUsageHistory.data.map((session: ResourceUsage) => (
                  <TableRow key={session.id}>
                    {renderSessionCells(session)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-center mt-4">
              <Pagination
                total={typedUsageHistory.totalPages || 1}
                page={page}
                onChange={handlePageChange}
              />
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
