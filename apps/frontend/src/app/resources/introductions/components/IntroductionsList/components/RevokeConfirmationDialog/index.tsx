import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
import { Textarea } from '@heroui/input';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from '../../../../../../../i18n';
import * as en from './translations/en';
import * as de from './translations/de';
import { useToastMessage } from '../../../../../../../components/toastProvider';
import { useResourceIntroductionServiceGetOneResourceIntroduction, useResourceIntroductionServiceMarkRevoked, useResourceIntroductionServiceMarkUnrevoked } from '@attraccess/react-query-client';

export enum RevokeDialogMode {
  REVOKE = 'revoke',
  UNREVOKE = 'unrevoke',
}

export type RevokeConfirmationDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: RevokeDialogMode;
  resourceId: number;
  introductionId: number;
};

export const RevokeConfirmationDialog = ({
  isOpen,
  onClose,
  mode,
  resourceId,
  introductionId,
}: RevokeConfirmationDialogProps) => {
  const { t } = useTranslations('revokeConfirmationDialog', {
    en,
    de,
  });

  const [comment, setComment] = useState('');

  const revokeIntroduction = useResourceIntroductionServiceMarkRevoked();
  const unrevokeIntroduction = useResourceIntroductionServiceMarkUnrevoked();

  const { success, error: showError } = useToastMessage();

  const { data: intro } = useResourceIntroductionServiceGetOneResourceIntroduction({resourceId, introductionId});

  const isSubmitting = useMemo(() => {
    return revokeIntroduction.isPending || unrevokeIntroduction.isPending;
  }, [revokeIntroduction.isPending, unrevokeIntroduction.isPending]);

  const username = useMemo(() => {
    return intro?.receiverUser?.username || `User ${intro?.receiverUserId}`;
  }, [intro]);

  const handleRevoke = useCallback(() => {
    revokeIntroduction.mutate(
      {
        resourceId: resourceId,
        introductionId: introductionId,
        requestBody: {comment},
      },
      {
        onSuccess: () => {
          onClose();
          success({
            title: t('revoke.success.title'),
            description: t('revoke.success.description', {
              username,
            }),
          });
        },
        onError: (err) => {
          showError({
            title: t('revoke.error.title'),
            description: t('revoke.error.description'),
          });
          console.error('Failed to revoke introduction:', err);
        },
      }
    );
  }, [
    comment,
    introductionId,
    onClose,
    resourceId,
    success,
    t,
    revokeIntroduction,
    showError,
    username,
  ]);

  const handleUnrevoke = useCallback(() => {
    unrevokeIntroduction.mutate(
      {
        resourceId: resourceId,
        introductionId: introductionId,
        requestBody: {comment},
      },
      {
        onSuccess: () => {
          onClose();
          success({
            title: t('unrevoke.success.title'),
            description: t('unrevoke.success.description', {
              username,
            }),
          });
        },
        onError: (err) => {
          showError({
            title: t('unrevoke.error.title'),
            description: t('unrevoke.error.description'),
          });
          console.error('Failed to unrevoke introduction:', err);
        },
      }
    );
  }, [
    comment,
    onClose,
    success,
    t,
    unrevokeIntroduction,
    showError,
    introductionId,
    resourceId,
    username,
  ]);

  const handleConfirm = useCallback(() => {
    if (mode === RevokeDialogMode.REVOKE) {
      handleRevoke();
    } else {
      handleUnrevoke();
    }
  }, [handleRevoke, handleUnrevoke, mode]);

  useEffect(() => {
    if (isOpen) {
      setComment('');
    }
  }, [setComment, isOpen]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          {mode === RevokeDialogMode.REVOKE
            ? t('title.revoke')
            : t('title.unrevoke')}
        </ModalHeader>

        <ModalBody>
          <p className="mb-4">
            {mode === RevokeDialogMode.REVOKE
              ? t('confirmMessage.revoke', {
                  username,
                })
              : t('confirmMessage.unrevoke', {
                  username,
                })}
          </p>
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              {t('commentLabel')}
            </label>
            <Textarea
              id="comment"
              placeholder={t('commentPlaceholder')}
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setComment(e.target.value)
              }
              className="w-full"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="bordered" onPress={onClose}>
            {t('cancel')}
          </Button>
          <Button onPress={handleConfirm} isLoading={isSubmitting}>
            {t('confirm')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
