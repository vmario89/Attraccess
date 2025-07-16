import React, { useCallback, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Alert } from '@heroui/alert';
import { useTranslations } from '@fabaccess/plugins-frontend-ui';
import { PasswordInput } from '../../components/PasswordInput';
import { useLogin } from '../../hooks/useAuth';
import * as en from './loginForm.en.json';
import * as de from './loginForm.de.json';

interface LoginFormProps {
  onNeedsAccount: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ onNeedsAccount, onForgotPassword }: LoginFormProps) {
  const { t } = useTranslations('login', {
    en,
    de,
  });

  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit: React.FormEventHandler = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const usernameOrEmail = formData.get('usernameOrEmail');
      const password = formData.get('password');

      if (typeof usernameOrEmail !== 'string' || typeof password !== 'string') {
        return;
      }

      login({
        usernameOrEmail,
        password,
      });
    },
    [login]
  );

  const memoizedArrowRight = useMemo(
    () => <ArrowRight className="group-hover:translate-x-1 transition-transform" />,
    []
  );

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold">{t('title')}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {t('noAccount')}{' '}
          <Button
            onPress={onNeedsAccount}
            variant="light"
            color="secondary"
            isDisabled={isPending}
            data-cy="login-form-sign-up-button"
          >
            {t('signUpButton')}
          </Button>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit} data-cy="login-form">
        <Input
          id="usernameOrEmail"
          name="usernameOrEmail"
          type="text"
          label={t('usernameOrEmail')}
          variant="underlined"
          required
          isDisabled={isPending}
          data-cy="login-form-username-input"
        />
        <PasswordInput
          id="password"
          name="password"
          label={t('password')}
          variant="underlined"
          required
          isDisabled={isPending}
          data-cy="login-form-password-input"
        />
        <div className="flex items-center justify-between">
          <Button
            onPress={onForgotPassword}
            variant="light"
            color="secondary"
            isDisabled={isPending}
            data-cy="login-form-forgot-password-button"
          >
            {t('forgotPassword')}
          </Button>
        </div>
        <Button
          type="submit"
          fullWidth
          color="primary"
          endContent={memoizedArrowRight}
          isLoading={isPending}
          isDisabled={isPending}
          data-cy="login-form-sign-in-button"
        >
          {isPending ? t('signingIn') : t('signInButton')}
        </Button>

        {(error as Error) && (
          <Alert
            color="danger"
            title={t('error.title')}
            description={(error as Error).message}
            data-cy="login-form-error-alert"
          />
        )}
      </form>
    </>
  );
}
