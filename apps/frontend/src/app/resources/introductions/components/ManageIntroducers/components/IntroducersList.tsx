import { useCallback, useState } from 'react';
import { Listbox, ListboxItem } from '@heroui/listbox';
import { Trash2 } from 'lucide-react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';
import { Button } from '@heroui/button';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  useRemoveIntroducer,
  useResourceIntroducers,
} from '@frontend/api/hooks/resourceIntroduction';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useToastMessage } from '@frontend/components/toastProvider';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AttraccessUser } from '@frontend/components/AttraccessUser';

import * as en from './translations/introducersList.en';
import * as de from './translations/introducersList.de';

export interface Introducer {
  id: number;
  userId: number;
  user: {
    username: string;
  };
}

export interface IntroducersListProps {
  resourceId: number;
}

export function IntroducersList({ resourceId }: IntroducersListProps) {
  const { t } = useTranslations('introducersList', {
    en,
    de,
  });

  const { data: introducers } = useResourceIntroducers(resourceId);

  const { success, error: showError } = useToastMessage();

  // State for the confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [introducerToRemove, setIntroducerToRemove] =
    useState<Introducer | null>(null);

  const handleRemoveClick = useCallback((introducer: Introducer) => {
    setIntroducerToRemove(introducer);
    setIsConfirmModalOpen(true);
  }, []);

  const removeIntroducer = useRemoveIntroducer();

  const handleConfirmRemove = useCallback(async () => {
    if (!introducerToRemove) {
      return;
    }

    try {
      await removeIntroducer.mutateAsync({
        resourceId,
        userId: introducerToRemove.userId,
      });
      success({
        title: t('success.removed.title'),
        description: t('success.removed.description'),
      });
    } catch (err) {
      showError({
        title: t('error.removeFailed.title'),
        description: t('error.removeFailed.description'),
      });
      console.error('Failed to remove introducer:', err);
    }

    setIsConfirmModalOpen(false);
    setIntroducerToRemove(null);
  }, [introducerToRemove, removeIntroducer, resourceId, success, showError, t]);

  const handleCancelRemove = useCallback(() => {
    setIsConfirmModalOpen(false);
    setIntroducerToRemove(null);
  }, []);

  return (
    <>
      <Listbox aria-label={t('currentIntroducers')} variant="flat">
        {(introducers || []).map((introducer) => (
          <ListboxItem
            key={introducer.id}
            textValue={introducer.user.username}
            endContent={
              <Button
                color="danger"
                onPress={() => handleRemoveClick(introducer)}
                isIconOnly
                aria-label={t('removeIntroducer', {
                  username: introducer.user.username,
                })}
              >
                <Trash2 />
              </Button>
            }
          >
            <AttraccessUser user={introducer.user} />
          </ListboxItem>
        ))}
      </Listbox>

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {t('removeConfirmation.title')}
          </ModalHeader>
          <ModalBody>
            <p>
              {t('removeConfirmation.message', {
                username: introducerToRemove?.user.username || '',
              })}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={handleCancelRemove}>
              {t('removeConfirmation.cancel')}
            </Button>
            <Button
              color="danger"
              onPress={handleConfirmRemove}
              isLoading={removeIntroducer.isPending}
            >
              {t('removeConfirmation.confirm')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
