import { useState } from 'react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardHeader, CardBody } from '@heroui/react';
import { ResourceUsage } from '@attraccess/react-query-client';
import { HistoryTable } from './components/HistoryTable';
import { HistoryHeader } from './components/HistoryHeader';
import { UsageNotesModal } from './components/UsageNotesModal';
import * as en from './translations/resourceUsageHistory.en';
import * as de from './translations/resourceUsageHistory.de';

// Types
interface ResourceUsageHistoryProps {
  resourceId: number;
}

// Main component
export function ResourceUsageHistory({ resourceId }: ResourceUsageHistoryProps) {
  const { t } = useTranslations('resourceUsageHistory', { en, de });
  const { hasPermission } = useAuth();
  const canManageResources = hasPermission('canManageResources');

  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ResourceUsage | null>(null);

  const handleSessionClick = (session: ResourceUsage) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center px-6 py-5">
        <HistoryHeader
          title={t('usageHistory')}
          showAllUsers={showAllUsers}
          setShowAllUsers={setShowAllUsers}
          canManageResources={canManageResources}
        />
      </CardHeader>

      <CardBody>
        <HistoryTable
          resourceId={resourceId}
          showAllUsers={showAllUsers}
          canManageResources={canManageResources}
          onSessionClick={handleSessionClick}
        />
      </CardBody>

      <UsageNotesModal isOpen={isModalOpen} onClose={handleCloseModal} session={selectedSession} />
    </Card>
  );
}
