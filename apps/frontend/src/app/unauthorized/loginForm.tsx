import React, { useCallback, useState, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Input } from '@heroui/input';
import { Checkbox } from '@heroui/checkbox';
import { Button } from '@heroui/button';
import { Alert } from '@heroui/alert';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import { useAuth } from '../../hooks/useAuth';
import * as en from './translations/login.en';
import * as de from './translations/login.de';

interface LoginFormProps {
  onNeedsAccount: () => void;
  onForgotPassword: () => void;
}

export function LoginForm({ onNeedsAccount, onForgotPassword }: LoginFormProps) {
  const { t } = useTranslations('login', {
    en,
    de,
  });

  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const username = formData.get('username');
      const password = formData.get('password');

      if (typeof username !== 'string' || typeof password !== 'string') {
        return;
      }

      try {
        await login.mutateAsync({
          username,
          password,
          persist: rememberMe,
        });
      } catch (err) {
        const error = err as { error?: { message?: string }; message?: string };
        setError(error.error?.message || error.message || 'An unexpected error occurred');
      }
    },
    [login, rememberMe]
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
          <Button onPress={onNeedsAccount} variant="light" color="secondary" isDisabled={login.isPending}>
            {t('signUpButton')}
          </Button>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <Input
          id="username"
          name="username"
          type="text"
          label={t('username')}
          variant="underlined"
          required
          isDisabled={login.isPending}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label={t('password')}
          variant="underlined"
          required
          isDisabled={login.isPending}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Checkbox
              name="remember-me"
              isSelected={rememberMe}
              onValueChange={setRememberMe}
              isDisabled={login.isPending}
            >
              {t('rememberMe')}
            </Checkbox>
          </div>

          <Button onPress={onForgotPassword} variant="light" color="secondary" isDisabled={login.isPending}>
            {t('forgotPassword')}
          </Button>
        </div>
        <Button
          type="submit"
          fullWidth
          color="primary"
          endContent={memoizedArrowRight}
          isLoading={login.isPending}
          isDisabled={login.isPending}
        >
          {login.isPending ? t('signingIn') : t('signInButton')}
        </Button>

        {error && <Alert color="danger" title={t('error.title')} description={error} />}
      </form>
    </>
  );
}
