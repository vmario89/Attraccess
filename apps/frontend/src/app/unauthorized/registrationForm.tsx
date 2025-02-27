import React, { useCallback, useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Alert } from '@heroui/alert';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/modal';
import { useTranslations } from '../../i18n';
import { useAuth } from '../../hooks/useAuth';
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

  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleSubmit: React.FormEventHandler = useCallback(
    async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      const username = formData.get('username');
      const password = formData.get('password');
      const email = formData.get('email');

      if (
        typeof username !== 'string' ||
        typeof password !== 'string' ||
        typeof email !== 'string'
      ) {
        return;
      }

      try {
        await signup.mutateAsync({
          username,
          password,
          email,
          strategy: 'local_password',
        });
        setRegisteredEmail(email);
        onOpen();
      } catch (err) {
        const error = err as { error?: { message?: string } };
        setError(error.error?.message || 'An unexpected error occurred');
      }
    },
    [signup, onOpen]
  );

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold">{t('title')}</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {t('hasAccount')}{' '}
          <Button
            onPress={onHasAccount}
            variant="light"
            color="secondary"
            isDisabled={signup.isPending}
          >
            {t('signInButton')}
          </Button>
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <Input
          id="username"
          name="username"
          type="text"
          label={t('username')}
          required
          variant="underlined"
          isDisabled={signup.isPending}
        />

        <Input
          id="email"
          name="email"
          type="email"
          label={t('email')}
          required
          variant="underlined"
          isDisabled={signup.isPending}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label={t('password')}
          required
          variant="underlined"
          isDisabled={signup.isPending}
        />

        <Button
          color="primary"
          fullWidth
          type="submit"
          endContent={
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          }
          isLoading={signup.isPending}
          isDisabled={signup.isPending}
        >
          {signup.isPending ? t('creatingAccount') : t('createAccountButton')}
        </Button>

        {error && (
          <Alert color="danger" title={t('error.title')} description={error} />
        )}
      </form>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="text-center">{t('success.title')}</div>
              </ModalHeader>
              <ModalBody>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  {t('success.message').replace('{email}', registeredEmail)}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" fullWidth onPress={onClose}>
                  {t('success.closeButton')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
