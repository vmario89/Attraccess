import { memo, useState } from 'react';
import { RegistrationForm } from './registrationForm';
import { LoginForm } from './loginForm';
import { UnauthorizedLayout } from './layout';
import { useTranslations } from '../../i18n';
import * as en from './translations/unauthorized.en';
import * as de from './translations/unauthorized.de';

export const Unauthorized = memo(function () {
  const { t } = useTranslations('unauthorized', {
    en,
    de,
  });

  const [formToShow, setFormToShow] = useState<
    'login' | 'register' | 'forgotPassword'
  >('login');

  return (
    <UnauthorizedLayout title={t('title')} subtitle={t('subtitle')}>
      {formToShow === 'login' && (
        <LoginForm
          onNeedsAccount={() => setFormToShow('register')}
          onForgotPassword={() => setFormToShow('forgotPassword')}
        />
      )}
      {formToShow === 'register' && (
        <RegistrationForm onHasAccount={() => setFormToShow('login')} />
      )}
    </UnauthorizedLayout>
  );
});
