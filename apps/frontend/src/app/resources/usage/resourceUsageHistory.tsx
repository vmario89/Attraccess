import React, { useState, useMemo } from 'react';
import { Card, CardBody, CardHeader, Spinner } from '@heroui/react';
import { useResourceUsageHistory } from '../../../api/hooks/resourceUsage';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslations } from '../../../i18n';
import * as en from './translations/resourceUsageHistory.en';
import * as de from './translations/resourceUsageHistory.de';
import { ResourceUsage } from '@attraccess/api-client';
import { HistoryTable } from './components/HistoryTable';
import { HistoryHeader } from './components/HistoryHeader';
import { HistoryPagination } from './components/HistoryPagination';
import { UsageNotesModal } from './components/UsageNotesModal';

// Types
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

// Main component
export function ResourceUsageHistory({
  resourceId,
}: ResourceUsageHistoryProps) {
  const { t } = useTranslations('resourceUsageHistory', { en, de });
  const { hasPermission } = useAuth();
  const canManageResources = hasPermission('canManageResources');

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: usageHistory,
    isLoading,
    error,
  } = useResourceUsageHistory(resourceId, page, rowsPerPage, showAllUsers);

  // Cast the response to the correct type
  const typedUsageHistory = usageHistory as PaginatedResourceUsage | undefined;

  // Derive the selected session from the ID using useMemo
  const selectedSession = useMemo(() => {
    if (!selectedSessionId || !typedUsageHistory?.data) return null;
    return (
      typedUsageHistory.data.find(
        (session) => session.id === selectedSessionId
      ) || null
    );
  }, [selectedSessionId, typedUsageHistory?.data]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSessionClick = (session: ResourceUsage) => {
    setSelectedSessionId(session.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <HistoryHeader
          title={t('usageHistory')}
          showAllUsers={showAllUsers}
          setShowAllUsers={setShowAllUsers}
          canManageResources={canManageResources}
        />
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
        ) : (
          <>
            <HistoryTable
              usageHistory={typedUsageHistory}
              showAllUsers={showAllUsers}
              canManageResources={canManageResources}
              onSessionClick={handleSessionClick}
            />

            {typedUsageHistory && typedUsageHistory.totalPages > 1 && (
              <HistoryPagination
                currentPage={page}
                totalPages={typedUsageHistory.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </CardBody>

      <UsageNotesModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        session={selectedSession}
      />
    </Card>
  );
}
