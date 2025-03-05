// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import * as en from './translations/en';
import * as de from './translations/de';
import { Ban, HistoryIcon, RefreshCw } from 'lucide-react';
import { Button } from '@heroui/button';
import { useMemo, useState } from 'react';
import {
  RevokeConfirmationDialog,
  RevokeDialogMode,
} from '../RevokeConfirmationDialog';
import { ResourceIntroduction } from '@attraccess/api-client';
import { IntroductionHistoryDialog } from '../IntroductionHistoryDialog';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useCheckIntroductionRevokedStatus } from '@frontend/api/hooks/resourceIntroduction';

interface IntroductionListItemActionsProps {
  resourceId: number;
  introduction: ResourceIntroduction;
}

export function IntroductionListItemActions(
  props: IntroductionListItemActionsProps
) {
  const { t } = useTranslations('introductionListItemEndContent', {
    en,
    de,
  });

  const { resourceId, introduction } = props;

  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<RevokeDialogMode>(
    RevokeDialogMode.REVOKE
  );
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  const { data: revokedData } = useCheckIntroductionRevokedStatus(
    resourceId,
    introduction.id
  );
  const isRevoked = useMemo(
    () => revokedData?.isRevoked || false,
    [revokedData]
  );

  const handleRevoke = () => {
    setDialogMode(RevokeDialogMode.REVOKE);
    setShowRevokeDialog(true);
  };

  const handleUnrevoke = () => {
    setDialogMode(RevokeDialogMode.UNREVOKE);
    setShowRevokeDialog(true);
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="ghost"
        onPress={() => setShowHistoryDialog(true)}
        title={t('history')}
      >
        <HistoryIcon className="h-4 w-4 mr-1" />
        {t('history')}
      </Button>

      {isRevoked ? (
        <Button
          size="sm"
          color="primary"
          variant="bordered"
          startContent={<RefreshCw className="h-4 w-4" />}
          onPress={handleUnrevoke}
          title={t('unrevokeAccess')}
        >
          {t('unrevokeAccess')}
        </Button>
      ) : (
        <Button
          size="sm"
          color="primary"
          variant="bordered"
          startContent={<Ban className="h-4 w-4" />}
          onPress={handleRevoke}
          title={t('revokeAccess')}
        >
          {t('revokeAccess')}
        </Button>
      )}

      <IntroductionHistoryDialog
        isOpen={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        resourceId={resourceId}
        introductionId={introduction.id}
      />

      <RevokeConfirmationDialog
        isOpen={showRevokeDialog}
        onClose={() => setShowRevokeDialog(false)}
        mode={dialogMode}
        introductionId={introduction.id}
        resourceId={resourceId}
      />
    </div>
  );
}
