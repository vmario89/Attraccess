import { useTranslations } from '@attraccess/plugins-frontend-ui';
import * as en from './translations/en';
import * as de from './translations/de';
import { Chip } from '@heroui/chip';
import { useMemo } from 'react';
import { DateTimeDisplay, AttraccessUser } from '@attraccess/plugins-frontend-ui';
import {
  useResourceIntroductionsServiceCheckIsRevokedStatus,
  ResourceIntroduction,
} from '@attraccess/react-query-client';

interface IntroductionListItemContentProps {
  introduction: ResourceIntroduction;
  resourceId: number;
}

export function IntroductionListItemContent(props: IntroductionListItemContentProps) {
  const { t } = useTranslations('introductionListItemContent', {
    en,
    de,
  });

  const { introduction, resourceId } = props;

  const { data: revokedData } = useResourceIntroductionsServiceCheckIsRevokedStatus({
    resourceId,
    introductionId: introduction.id,
  });
  const isRevoked = useMemo(() => revokedData?.isRevoked || false, [revokedData]);

  const tutorname = useMemo(() => {
    return (
      introduction.tutorUser?.username || (introduction.tutorUserId ? `User ${introduction.tutorUserId}` : t('unknown'))
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
