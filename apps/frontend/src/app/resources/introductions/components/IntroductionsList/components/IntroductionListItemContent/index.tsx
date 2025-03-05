// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import * as en from './translations/en';
import * as de from './translations/de';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useCheckIntroductionRevokedStatus } from '@frontend/api/hooks/resourceIntroduction';
import { Chip } from '@heroui/chip';
import { useMemo } from 'react';
import { ResourceIntroduction } from '@attraccess/api-client';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { DateTimeDisplay } from '@frontend/components/DateTimeDisplay';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { AttraccessUser } from '@frontend/components/AttraccessUser';

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

  const tutorname = useMemo(() => {
    return (
      introduction.tutorUser?.username ||
      (introduction.tutorUserId
        ? `User ${introduction.tutorUserId}`
        : t('unknown'))
    );
  }, [introduction, t]);

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <AttraccessUser
          user={introduction.receiverUser}
          description={
            <>
              <span>
                {t('introducedBy', {
                  tutor: tutorname,
                })}
              </span>
              <br />
              <DateTimeDisplay date={introduction.completedAt} />
            </>
          }
        />
      </div>

      {isRevoked && (
        <Chip color="danger" size="sm">
          {t('revoked')}
        </Chip>
      )}
    </div>
  );
}
