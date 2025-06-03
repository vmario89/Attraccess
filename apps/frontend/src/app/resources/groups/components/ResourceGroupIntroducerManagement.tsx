import React, { useState } from 'react';
import {
  useResourceGroupIntroductionsServiceGetResourceGroupIntroducers,
  useResourceGroupIntroductionsServiceAddResourceGroupIntroducer,
  useResourceGroupIntroductionsServiceRemoveResourceGroupIntroducer,
} from '@attraccess/react-query-client';
import { useTranslations, UserSearch } from '@attraccess/plugins-frontend-ui';
import { Button, Input, Spinner, Alert, List, ListItem } from '@heroui/react';

// Assuming translations are passed down or accessed via context if this becomes a common pattern
// For now, using the same translation file as the parent page.
import * as en from '../translations/resourceGroupEditPage.en.json';
import * as de from '../translations/resourceGroupEditPage.de.json';

interface ResourceGroupIntroducerManagementProps {
  groupId: number;
}

export function ResourceGroupIntroducerManagement({ groupId }: ResourceGroupIntroducerManagementProps) {
  const { t } = useTranslations('resourceGroupEditPage', { en, de });
  const [selectedIntroducerId, setSelectedIntroducerId] = useState<number | null>(null);

  const {
    data: introducersData,
    isLoading: isLoadingIntroducers,
    error: errorLoadingIntroducers,
    refetch: refetchIntroducers,
  } = useResourceGroupIntroductionsServiceGetResourceGroupIntroducers(
    { resourceGroupId: groupId },
    { query: { enabled: !!groupId } }
  );

  const addIntroducerMutation = useResourceGroupIntroductionsServiceAddResourceGroupIntroducer({
    onSuccess: () => {
      toast.success(t('addIntroducerSuccess'));
      setSelectedIntroducerId(null); // Updated this line
      refetchIntroducers();
    },
    onError: (err: Error) => {
      toast.error(t('addIntroducerError') + `: ${err.message}`);
    },
  });

  const removeIntroducerMutation = useResourceGroupIntroductionsServiceRemoveResourceGroupIntroducer({
    onSuccess: () => {
      toast.success(t('removeIntroducerSuccess'));
      refetchIntroducers();
    },
    onError: (err: Error) => {
      toast.error(t('removeIntroducerError') + `: ${err.message}`);
    },
  });

  const handleAddIntroducer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntroducerId) {
      // Optionally, provide feedback to the user, e.g., using a toast notification
      // toast.error(t('pleaseSelectUserError')); // Assuming such a key exists or is added
      return;
    }
    addIntroducerMutation.mutate({
      resourceGroupId: groupId,
      requestBody: { userId: selectedIntroducerId },
    });
  };

  const handleRemoveIntroducer = (userId: number) => {
    removeIntroducerMutation.mutate({
      resourceGroupId: groupId,
      userId,
    });
  };

  if (isLoadingIntroducers) {
    return <Spinner label={t('loadingIntroducers')} />;
  }

  if (errorLoadingIntroducers) {
    return <Alert type="danger" message={t('errorLoadingIntroducers') + `: ${errorLoadingIntroducers.message}`} />;
  }

  const introducers = introducersData?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2">
          {t('currentIntroducersSubheader')}
        </h3>
        {introducers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('noIntroducersFound')}</p>
        ) : (
          <List divided>
            {introducers.map((introducerUser) => (
              <ListItem key={introducerUser.userId} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {introducerUser.user?.displayName || `User ID: ${introducerUser.userId}`}
                  </p>
                  {introducerUser.user?.email && (
                     <p className="text-sm text-gray-500 dark:text-gray-400">{introducerUser.user.email}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  color="danger"
                  onClick={() => handleRemoveIntroducer(introducerUser.userId)}
                  loading={removeIntroducerMutation.isPending && removeIntroducerMutation.variables?.userId === introducerUser.userId}
                >
                  {t('removeIntroducerButton')}
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2">
          {t('addIntroducerSubheader')}
        </h3>
        <form onSubmit={handleAddIntroducer} className="space-y-3 sm:flex sm:space-y-0 sm:space-x-3 sm:items-end">
          <div className="flex-grow">
            <UserSearch
              label={t('userIdLabel')}
              placeholder={t('userIdLabel')} // Consider a more descriptive placeholder like "Search user by name or email"
              onSelectionChange={setSelectedIntroducerId}
            />
          </div>
          <Button
            type="submit"
            color="primary"
            loading={addIntroducerMutation.isPending}
            disabled={!selectedIntroducerId || addIntroducerMutation.isPending}
            className="w-full sm:w-auto"
          >
            {t('addIntroducerButton')}
          </Button>
        </form>
      </div>
    </div>
  );
}
