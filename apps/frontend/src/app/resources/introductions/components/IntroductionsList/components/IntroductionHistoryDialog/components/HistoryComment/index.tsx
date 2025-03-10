import { Divider, Textarea } from '@heroui/react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import * as en from './translations/en';
import * as de from './translations/de';

export type HistoryCommentProps = {
  comment: string;
};

export const HistoryComment = ({ comment }: HistoryCommentProps) => {
  const { t } = useTranslations('historyComment', {
    en,
    de,
  });

  return (
    <>
      <Divider className="my-3" />
      <Textarea label={t('comment')} value={comment} readOnly />
    </>
  );
};
