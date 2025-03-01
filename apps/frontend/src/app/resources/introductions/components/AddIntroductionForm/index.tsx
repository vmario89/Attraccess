import { Input } from '@heroui/input';
import { Loader2 } from 'lucide-react';
import { useTranslations } from '../../../../../i18n';
import * as en from './translations/en';
import * as de from './translations/de';

export type AddIntroductionFormProps = {
  userIdentifier: string;
  setUserIdentifier: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export const AddIntroductionForm = ({
  userIdentifier,
  setUserIdentifier,
  onSubmit,
  isSubmitting,
}: AddIntroductionFormProps) => {
  const { t } = useTranslations('addIntroductionForm', {
    en,
    de,
  });

  return (
    <form
      className="mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Input
        value={userIdentifier}
        onChange={(e) => setUserIdentifier(e.target.value)}
        className="flex-1"
        label={t('addNew.label')}
        endContent={isSubmitting ? <Loader2 /> : null}
      />
    </form>
  );
};
