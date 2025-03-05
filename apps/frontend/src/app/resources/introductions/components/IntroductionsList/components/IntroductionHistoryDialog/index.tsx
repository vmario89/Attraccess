import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@heroui/modal';

import { HistoryItem } from './components/HistoryItem';
import { EmptyState } from './components/EmptyState';

import * as en from './translations/en';
import * as de from './translations/de';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import { useIntroductionHistory } from '../../../../../../../api/hooks/resourceIntroduction';

export type IntroductionHistoryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  resourceId: number;
  introductionId: number;
};

export const IntroductionHistoryDialog = ({
  isOpen,
  onClose,
  resourceId,
  introductionId,
}: IntroductionHistoryDialogProps) => {
  const { t } = useTranslations('introductionHistoryDialog', {
    en,
    de,
  });

  // Note: If there is no introduction found with the given ID, this will return empty history
  const { data: historyData, isLoading } = useIntroductionHistory(
    resourceId,
    introductionId
  );
  const history = historyData || [];

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} scrollBehavior="inside">
      <ModalContent className="sm:max-w-md">
        <ModalHeader>{t('title')}</ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div className="text-center py-10 px-4">
              <div className="text-gray-500 dark:text-gray-400">
                {t('loading')}
              </div>
            </div>
          ) : history.length === 0 ? (
            <EmptyState />
          ) : (
            history.map((item) => (
              <HistoryItem
                key={item.id}
                timestamp={item.createdAt}
                revoked={item.action === 'revoke'}
                userName={item.performedByUser?.username || ''}
                comment={item.comment}
              />
            ))
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            onClick={onClose}
          >
            {t('close')}
          </button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
