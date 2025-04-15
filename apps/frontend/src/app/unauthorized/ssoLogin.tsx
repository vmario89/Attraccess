// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import { Button, Divider, Link } from '@heroui/react';
import * as de from './translations/ssoLoginButon.de';
import * as en from './translations/ssoLoginButton.en';
import { useCallback, useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { getBaseUrl } from '@frontend/api';
import { useLocation } from 'react-router-dom';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useAuth } from '@frontend/hooks/useAuth';
import { useSsoServiceGetAllSsoProviders, SSOProvider } from '@attraccess/react-query-client';

function useCallbackURL(providerId: number, providerType: SSOProvider['type']) {
  return useMemo(() => {
    const apiBaseUrl = getBaseUrl();
    const encodedCallbackURL = encodeURIComponent(window.location.href);
    return `${apiBaseUrl}/api/auth/sso/${providerType}/${providerId}/login?redirectTo=${encodedCallbackURL}`;
  }, [providerId, providerType]);
}

interface SSOLoginButtonProps {
  provider: SSOProvider;
}

function SSOLoginButton(props: SSOLoginButtonProps) {
  const { t } = useTranslations('ssoLoginButton', {
    de,
    en,
  });
  const { provider } = props;

  const loginHref = useCallbackURL(provider.id, provider.type);

  return (
    <Button as={Link} href={loginHref} fullWidth>
      {t('loginWith', { provider: provider.name })}
    </Button>
  );
}

export function SSOLogin() {
  const { isLoading, data: providers } = useSsoServiceGetAllSsoProviders();
  const location = useLocation();
  const { jwtTokenLogin } = useAuth();

  const [didExecuteSSOCallback, setDidExecuteSSOCallback] = useState(false);

  const query = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location]);

  const callSSOCallback = useCallback(async () => {
    if (didExecuteSSOCallback) {
      return;
    }

    setDidExecuteSSOCallback(true);

    const authString = query.get('auth');
    if (!authString) {
      return;
    }

    const auth = JSON.parse(authString);

    await jwtTokenLogin.mutateAsync(auth);
  }, [didExecuteSSOCallback, jwtTokenLogin, query]);

  useEffect(() => {
    callSSOCallback();
  }, [callSSOCallback]);

  if (providers?.length === 0 || isLoading) {
    return null;
  }

  return (
    <>
      <Divider />
      {providers?.map((provider) => (
        <SSOLoginButton key={provider.id} provider={provider} />
      ))}
    </>
  );
}
