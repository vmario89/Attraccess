import React, { useState } from 'react';
import {
  useResourceGroupIntroductionsServiceCreateResourceGroupIntroduction,
} from '@attraccess/react-query-client';
import { useTranslations, useAuth, UserSearch } from '@attraccess/plugins-frontend-ui';
import { Button, Input } from '@heroui/react';
import toast from 'react-hot-toast';

import * as en from '../translations/resourceGroupEditPage.en.json';
import * as de from '../translations/resourceGroupEditPage.de.json';

interface ResourceGroupIntroductionGrantingProps {
  groupId: number;
  onIntroductionGranted?: () => void; // Optional callback to refresh lists
}

export function ResourceGroupIntroductionGranting({ groupId, onIntroductionGranted }: ResourceGroupIntroductionGrantingProps) {
  const { t } = useTranslations('resourceGroupEditPage', { en, de });
  const { user } = useAuth();
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null);
  // Pre-fill tutorId with the current user's ID if available, otherwise leave it empty for manual input
  const [tutorId, setTutorId] = useState(user?.id ? String(user.id) : '');

  const grantIntroductionMutation = useResourceGroupIntroductionsServiceCreateResourceGroupIntroduction({
    onSuccess: () => {
      toast.success(t('grantIntroductionSuccess'));
      setSelectedRecipientId(null); // Updated this line
      // If not pre-filled or if admin can set any tutor, don't clear tutorId or reset to self
      // setTutorId(user?.id ? String(user.id) : ''); 
      if (onIntroductionGranted) {
        onIntroductionGranted();
      }
    },
    onError: (err: Error) => {
      toast.error(t('grantIntroductionError') + `: ${err.message}`);
    },
  });

  const handleGrantIntroduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId || !tutorId.trim()) {
      // Optionally, provide feedback to the user, e.g., using a toast notification
      // toast.error(t('pleaseSelectRecipientAndTutorError')); // Assuming such a key exists or is added
      return;
    }
    grantIntroductionMutation.mutate({
      resourceGroupId: groupId,
      requestBody: {
        recipientUserId: selectedRecipientId,
        tutorId: Number(tutorId),
      },
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
        {t('grantIntroductionSubheader')}
      </h3>
      <form onSubmit={handleGrantIntroduction} className="space-y-3">
        <div>
          <UserSearch
            label={t('recipientUserIdLabel')}
            placeholder={t('recipientUserIdLabel')} // Consider a more descriptive placeholder
            onSelectionChange={setSelectedRecipientId}
          />
        </div>
        <div>
          <Input
            type="number"
            label={t('tutorIdLabel')}
            placeholder={t('tutorIdLabel')}
            value={tutorId}
            onChange={(e) => setTutorId(e.target.value)}
            required
            // Potentially make this read-only if only self-introduction is allowed by non-admins
            // disabled={!user?.permissions.includes('manage_all_introductions') && !!user?.id}
          />
        </div>
        <Button
          type="submit"
          color="primary"
          loading={grantIntroductionMutation.isPending}
          disabled={!selectedRecipientId || !tutorId.trim() || grantIntroductionMutation.isPending}
        >
          {t('grantIntroductionButton')}
        </Button>
      </form>
    </div>
  );
}
