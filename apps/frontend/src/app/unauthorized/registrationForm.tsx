import { ArrowRight } from 'lucide-react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { useTranslations } from '../../i18n';
import * as en from './translations/register.en';
import * as de from './translations/register.de';

interface RegisterFormProps {
  onHasAccount: () => void;
}

export function RegistrationForm({ onHasAccount }: RegisterFormProps) {
  const { t } = useTranslations('register', {
    en,
    de,
  });

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold">{t('title')}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {t('hasAccount')}{' '}
          <Button onPress={onHasAccount} variant="light" color="secondary">
            {t('signInButton')}
          </Button>
        </p>
      </div>

      <form className="mt-8 space-y-6">
        <Input
          id="username"
          name="username"
          type="text"
          label={t('username')}
          required
          variant="underlined"
        />

        <Input
          id="password"
          name="password"
          type="password"
          label={t('password')}
          required
          variant="underlined"
        />

        <Button
          color="primary"
          fullWidth
          type="submit"
          endContent={
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          }
        >
          {t('createAccountButton')}
        </Button>
      </form>
    </>
  );
}
