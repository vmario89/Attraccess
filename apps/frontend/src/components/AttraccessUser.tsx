import { User } from '@attraccess/api-client';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import { User as UserComponent } from '@heroui/react';
import { toSvg } from 'jdenticon';
import { useMemo } from 'react';
import * as en from './translations/attraccessUser.en';
import * as de from './translations/attraccessUser.de';

interface AttraccessUserProps {
  user?: User;
  description?: string;
}

export function AttraccessUser(props: AttraccessUserProps) {
  const { user, description } = props;

  const { t } = useTranslations('attraccessUser', { en, de });

  const avatarIcon = useMemo(() => {
    return toSvg(user?.id || 'unknown', 100);
  }, [user]);

  return (
    <UserComponent
      avatarProps={{
        src: `data:image/svg+xml;utf8,${avatarIcon}`,
      }}
      description={description}
      name={user?.username || t('unknown')}
    />
  );
}
