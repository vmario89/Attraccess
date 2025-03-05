import { useTranslations } from '../../../../../../../i18n';
import * as en from './translations/en';
import * as de from './translations/de';
import { useCheckIntroductionRevokedStatus } from '../../../../../../../api/hooks/resourceIntroduction';
import { User } from '@heroui/user';
import { Chip } from '@heroui/chip';
import { useMemo } from 'react';
import { ResourceIntroduction } from '@attraccess/api-client';

interface IntroductionListItemContentProps {
  introduction: ResourceIntroduction;
  resourceId: number;
}

export function IntroductionListItemContent(
  props: IntroductionListItemContentProps
) {
  const { t } = useTranslations('introductionListItemContent', {
    en,
    de,
  });

  const { introduction, resourceId } = props;

  const { data: revokedData } = useCheckIntroductionRevokedStatus(
    resourceId,
    introduction.id
  );
  const isRevoked = useMemo(
    () => revokedData?.isRevoked || false,
    [revokedData]
  );

  const username = useMemo(
    () =>
      introduction.receiverUser?.username ||
      `User ${introduction.receiverUserId}`,
    [introduction]
  );

  const tutorname = useMemo(() => {
    return (
      introduction.tutorUser?.username ||
      (introduction.tutorUserId
        ? `User ${introduction.tutorUserId}`
        : t('unknown'))
    );
  }, [introduction, t]);

  return (
    <div className="flex items-center gap-2">
      <User
        name={username}
        description={
          <>
            <span>
              {t('introducedBy', {
                tutor: tutorname,
              })}
            </span>
            <br />
            <span className="text-xs text-gray-500">
              {new Date(introduction.completedAt).toLocaleDateString()}
            </span>
          </>
        }
        avatarProps={{
          showFallback: true,
          fallback: (introduction.receiverUser?.username
            ? introduction.receiverUser.username[0]
            : introduction.receiverUserId.toString()[0]
          ).toUpperCase(),
        }}
      />
      {isRevoked && (
        <Chip color="danger" size="sm" className="ml-2">
          {t('revoked')}
        </Chip>
      )}
    </div>
  );
}
