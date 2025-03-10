import { Card, CardBody, Chip } from '@heroui/react';
import { format } from 'date-fns';
import { HistoryComment } from '../HistoryComment';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import * as en from './translations/en';
import * as de from './translations/de';

export type HistoryItemProps = {
  timestamp: string;
  revoked: boolean;
  userName: string;
  comment?: string;
};

export const HistoryItem = ({
  timestamp,
  revoked,
  userName,
  comment,
}: HistoryItemProps) => {
  const { t } = useTranslations('historyItem', {
    en,
    de,
  });

  return (
    <Card classNames={{ base: 'bg-primary-100' }}>
      <CardBody>
        <div className="flex justify-between items-start">
          <div>
            <Chip color={revoked ? 'danger' : 'success'}>
              {revoked ? t('revoked') : t('unrevoked')}
            </Chip>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
            <span>{format(new Date(timestamp), 'dd.MM.yyyy HH:mm:ss')}</span>
            <br />

            <span>{t('by', { user: userName })}</span>
          </div>
        </div>
        {comment && <HistoryComment comment={comment} />}
      </CardBody>
    </Card>
  );
};
