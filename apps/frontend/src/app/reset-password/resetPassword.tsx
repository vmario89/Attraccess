import { useCallback, useMemo, useState } from 'react';
import { useUrlQuery } from '@attraccess/plugins-frontend-ui';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../loading';
import { Button, Card, CardBody, CardFooter, CardHeader, Form, Input } from '@heroui/react';
import { useTranslations } from '@attraccess/plugins-frontend-ui';
import * as en from './en.json';
import * as de from './de.json';
import { useUsersServiceChangePasswordViaResetToken } from '@attraccess/react-query-client';
import { useToastMessage } from '../../components/toastProvider';

export function ResetPassword() {
  const query = useUrlQuery();
  const navigate = useNavigate();
  const { t } = useTranslations('resetPassword', { en, de });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const token = useMemo(() => query.get('token'), [query]);
  const userId = useMemo(() => query.get('userId'), [query]);

  const toast = useToastMessage();

  const {
    mutate: changeMutation,
    isPending,
    isSuccess,
  } = useUsersServiceChangePasswordViaResetToken({
    onError: (error) => {
      toast.error({
        title: t('error.title'),
        description: t('error.message'),
      });
    },
  });

  const onMainButtonPress = useCallback(() => {
    if (password !== confirmPassword) {
      toast.error({
        title: t('error.passwordsDoNotMatch.title'),
        description: t('error.passwordsDoNotMatch.description'),
      });
      return;
    }

    changeMutation({ userId: parseInt(userId as string), requestBody: { token: token as string, password } });
  }, [password, confirmPassword, userId, token, t, changeMutation, toast]);

  if (isPending) {
    return <Loading />;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">{t('success.title')}</CardHeader>
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

  return (
    <Card>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          onMainButtonPress();
        }}
      >
        <CardHeader>{t('title')}</CardHeader>
        <CardBody>
          <Input
            label={t('inputs.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
            minLength={8}
            required
          />
          <Input
            label={t('inputs.confirmPassword')}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            validate={() => {
              if (password !== confirmPassword) {
                return t('error.passwordsDoNotMatch.description');
              }
              return true;
            }}
          />
        </CardBody>
        <CardFooter>
          <Button fullWidth color="primary" type="submit">
            {t('submit')}
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
}
