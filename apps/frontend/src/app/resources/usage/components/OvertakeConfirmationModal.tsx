import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import en from './translations/overtakeConfirmationModal.en.json';
import de from './translations/overtakeConfirmationModal.de.json';

interface OvertakeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string; // Optional: name of the user currently using the resource
  isLoading?: boolean;
}

export function OvertakeConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isLoading = false,
}: OvertakeConfirmationModalProps) {
  const { t } = useTranslations('overtakeConfirmationModal', { en, de });

  const message = userName
    ? t('messageWithUser', { userName })
    : t('message');

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} backdrop="blur">
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{t('title')}</ModalHeader>
            <ModalBody>
              <p>{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onCloseModal} disabled={isLoading}>
                {t('cancelButton')}
              </Button>
              <Button color="danger" onPress={onConfirm} isLoading={isLoading}>
                {t('confirmButton')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
