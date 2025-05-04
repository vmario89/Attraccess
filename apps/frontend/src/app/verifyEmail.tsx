import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUrlQuery } from '@attraccess/plugins-frontend-ui';
import { useNavigate } from 'react-router-dom';
import { Loading } from './loading';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Spacer } from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import * as en from './translations/verifyEmail.en';
import * as de from './translations/verifyEmail.de';
import { useUsersServiceVerifyEmail, UseUsersServiceGetCurrentKeyFn } from '@attraccess/react-query-client';
import { useQueryClient } from '@tanstack/react-query';

export function VerifyEmail() {
  const query = useUrlQuery();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useTranslations('verifyEmail', { en, de });

  const token = useMemo(() => query.get('token'), [query]);
  const email = useMemo(() => query.get('email'), [query]);

  const verifyEmail = useUsersServiceVerifyEmail();
  const queryClient = useQueryClient();

  const activateEmail = useCallback(async () => {
    if (!token || !email) {
      setError(t('apiErrors.invalidLink'));
      return;
    }

    try {
      await verifyEmail.mutateAsync({ requestBody: { token, email } });
      setIsSuccess(true);
      setError(null);

      queryClient.invalidateQueries({
        queryKey: [UseUsersServiceGetCurrentKeyFn()[0]],
      });
    } catch (err) {
      const error = err as { error?: { message?: string } };
      const errorMessage = error.error?.message || t('apiErrors.unexpectedError');

      // Check if a translation exists for this error message
      const translationKey = `apiErrors.${errorMessage}`;
      const translation = t(translationKey);

      if (translation !== translationKey) {
        setError(translation);
      } else {
        // If no translation exists, use the original error message
        setError(errorMessage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email, t, queryClient]);

  useEffect(() => {
    activateEmail();
  }, [activateEmail]);

  if (verifyEmail.isPending) {
    return <Loading />;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <h2 className="text-3xl font-bold">{t('success.title')}</h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{t('success.message')}</p>
          </CardBody>
          <CardFooter>
            <Button fullWidth color="primary" onPress={() => navigate('/')}>
              {t('success.goToLogin')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <h2 className="text-3xl font-bold">{t('error.title')}</h2>
          </CardHeader>
          <CardBody>
            <Alert color="danger" title={t('error.errorTitle')} description={error} />
          </CardBody>
          <CardFooter>
            <Button fullWidth color="primary" onPress={activateEmail} isDisabled={verifyEmail.isPending}>
              {t('error.tryAgain')}
            </Button>
            <Spacer y={2} />
            <Button fullWidth variant="bordered" onPress={() => navigate('/')}>
              {t('error.backToLogin')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <Loading />;
}
