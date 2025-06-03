import React from 'react';
import {
  useResourceGroupIntroductionsServiceGetResourceGroupIntroductions,
  useResourceIntroductionServiceRevokeIntroduction, // Generic revoke endpoint
} from '@attraccess/react-query-client';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { Button, Spinner, Alert, List, ListItem, Badge } from '@heroui/react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import * as en from '../translations/resourceGroupEditPage.en.json';
import * as de from '../translations/resourceGroupEditPage.de.json';

interface ResourceGroupIntroductionViewerProps {
  groupId: number;
  // This prop will be triggered by the Granting component to signal a refresh
  // We will use a queryKey invalidation or refetch for a more robust solution if needed,
  // but for now, a simple counter or a direct refetch call from parent might be simpler.
  // Let's make this component self-sufficient in refetching for now.
  // refreshCounter?: number; 
}

export function ResourceGroupIntroductionViewer({ groupId }: ResourceGroupIntroductionViewerProps) {
  const { t } = useTranslations('resourceGroupEditPage', { en, de });

  const {
    data: introductionsData,
    isLoading: isLoadingIntroductions,
    error: errorLoadingIntroductions,
    refetch: refetchIntroductions, // Added refetch here
  } = useResourceGroupIntroductionsServiceGetResourceGroupIntroductions(
    { resourceGroupId: groupId },
    { query: { enabled: !!groupId } }
  );

  const revokeMutation = useResourceIntroductionServiceRevokeIntroduction({
    onSuccess: () => {
      toast.success(t('revokeIntroductionSuccess'));
      refetchIntroductions(); // Refetch the list after revoking
    },
    onError: (err: Error) => {
      toast.error(t('revokeIntroductionError') + `: ${err.message}`);
    },
  });

  const handleRevokeIntroduction = (introductionId: number) => {
    revokeMutation.mutate({ introductionId });
  };

  // This effect can be used if a parent component signals a refresh, e.g. after granting a new intro.
  // useEffect(() => {
  //   if (groupId) {
  //     refetchIntroductions();
  //   }
  // }, [refreshCounter, refetchIntroductions, groupId]);

  if (isLoadingIntroductions) {
    return <Spinner label={t('loadingGroupIntroductions')} />;
  }

  if (errorLoadingIntroductions) {
    return <Alert type="danger" message={t('errorLoadingGroupIntroductions') + `: ${errorLoadingIntroductions.message}`} />;
  }

  const introductions = introductionsData?.data || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2">
        {t('currentGroupIntroductionsSubheader')}
      </h3>
      {introductions.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('noGroupIntroductionsFound')}</p>
      ) : (
        <List divided>
          {introductions.map((intro) => (
            <ListItem key={intro.id} className="items-start sm:items-center">
              <div className="flex-grow">
                <p className="font-medium">
                  {t('introductionRecipientLabel')}: {intro.recipientUser?.displayName || `ID: ${intro.recipientUserId}`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('introductionTutorLabel')}: {intro.tutorUser?.displayName || `ID: ${intro.tutorUserId}`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('introductionDateLabel')}: {format(new Date(intro.createdAt), 'PPpp')}
                </p>
                {intro.revokedAt && (
                    <Badge color="warning" className="mt-1">Revoked: {format(new Date(intro.revokedAt), 'PPpp')}</Badge>
                )}
              </div>
              {!intro.revokedAt && (
                <Button
                  size="sm"
                  variant="outline"
                  color="danger"
                  onClick={() => handleRevokeIntroduction(intro.id)}
                  loading={revokeMutation.isPending && revokeMutation.variables?.introductionId === intro.id}
                  className="mt-2 sm:mt-0"
                >
                  {t('revokeIntroductionButton')}
                </Button>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}
