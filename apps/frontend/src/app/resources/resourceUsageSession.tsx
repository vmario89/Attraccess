import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Divider,
  Avatar,
  Alert,
} from '@heroui/react';
import { Play, StopCircle, Clock, Users } from 'lucide-react';
import {
  useActiveSession,
  useStartSession,
  useEndSession,
} from '../../api/hooks/resourceUsage';
import {
  useCheckIntroductionStatus,
  useResourceIntroducers,
} from '../../api/hooks/resourceIntroduction';
import { useToastMessage } from '../../components/toastProvider';
import { useTranslations } from '../../i18n';
import * as en from './translations/resourceUsageSession.en';
import * as de from './translations/resourceUsageSession.de';

interface ResourceUsageSessionProps {
  resourceId: number;
}

export function ResourceUsageSession({
  resourceId,
}: ResourceUsageSessionProps) {
  const { t } = useTranslations('resourceUsageSession', { en, de });
  const { success, error: showError } = useToastMessage();

  // Check if user has completed the introduction
  const { data: hasCompletedIntroduction, isLoading: isLoadingIntroStatus } =
    useCheckIntroductionStatus(resourceId);

  // Get list of users who can give introductions
  const { data: introducers, isLoading: isLoadingIntroducers } =
    useResourceIntroducers(resourceId);

  // Get active session
  const { data: activeSession, isLoading: isLoadingSession } =
    useActiveSession(resourceId);
  const startSession = useStartSession();
  const endSession = useEndSession();

  // State to track elapsed time for display
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  // Update elapsed time every second when session is active
  useEffect(() => {
    if (!activeSession) {
      setElapsedTime('00:00:00');
      return;
    }

    const startTime = new Date(activeSession.startTime).getTime();

    const updateElapsedTime = () => {
      const now = new Date().getTime();
      const elapsed = now - startTime;

      // Format elapsed time as HH:MM:SS
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    // Update immediately and then every second
    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartSession = async () => {
    try {
      await startSession.mutateAsync({
        resourceId,
        dto: { notes: '' }, // Optional notes could be added with a form
      });
      success({
        title: t('sessionStarted'),
        description: t('sessionStartedDescription'),
      });
    } catch (err) {
      showError({
        title: t('sessionStartError'),
        description: t('sessionStartErrorDescription'),
      });
      console.error('Failed to start session:', err);
    }
  };

  const handleEndSession = async () => {
    try {
      // End the session
      await endSession.mutateAsync({
        resourceId,
        dto: { notes: '' }, // Optional notes could be added with a form
      });

      success({
        title: t('sessionEnded'),
        description: t('sessionEndedDescription'),
      });
    } catch (err) {
      console.error('Error ending session:', err);
      showError({
        title: t('sessionEndError'),
        description: t('sessionEndErrorDescription'),
      });
    }
  };

  const isLoading =
    isLoadingSession || isLoadingIntroStatus || isLoadingIntroducers;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('usageSession')}
          </h3>
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner size="md" color="primary" />
          </div>
        ) : activeSession ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('sessionStarted')}:
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(activeSession.startTime).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('elapsedTime')}:
                </p>
                <p className="font-medium text-xl text-gray-900 dark:text-white">
                  {elapsedTime}
                </p>
              </div>
            </div>
            <Button
              color="danger"
              variant="solid"
              fullWidth
              startContent={<StopCircle className="w-4 h-4" />}
              onPress={handleEndSession}
              isLoading={endSession.isPending}
            >
              {t('endSession')}
            </Button>
          </div>
        ) : !hasCompletedIntroduction ? (
          <div className="space-y-4">
            <Alert color="warning">{t('needsIntroduction')}</Alert>

            {introducers && introducers.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-2">
                  <Users className="w-4 h-4 mr-1" />
                  {t('availableIntroducers')}:
                </p>
                <Divider className="my-2" />
                <div className="space-y-2 mt-2">
                  {introducers.map((introducer) => (
                    <div
                      key={introducer.id}
                      className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                    >
                      <Avatar
                        name={introducer.user?.username || 'Unknown'}
                        color="primary"
                        size="sm"
                        className="mr-3"
                      />
                      <p className="font-medium text-gray-900 dark:text-white">
                        {introducer.user?.username || 'Unknown User'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                {t('noIntroducersAvailable')}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400">
              {t('noActiveSession')}
            </p>
            <Button
              color="primary"
              variant="solid"
              fullWidth
              startContent={<Play className="w-4 h-4" />}
              onPress={handleStartSession}
              isLoading={startSession.isPending}
            >
              {t('startSession')}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
