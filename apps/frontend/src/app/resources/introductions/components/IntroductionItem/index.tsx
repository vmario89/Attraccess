import { ResourceIntroduction } from '@attraccess/api-client';
import { User as UserComponent } from '@heroui/user';
import { useTranslations } from '../../../../../i18n';
import * as en from './translations/en';
import * as de from './translations/de';

export type IntroductionItemProps = {
  introduction: ResourceIntroduction;
};

export const IntroductionItem = ({
  introduction: intro,
}: IntroductionItemProps) => {
  const { t } = useTranslations('introductionItem', {
    en,
    de,
  });

  return (
    <UserComponent
      name={
        intro.receiverUser?.username
          ? intro.receiverUser.username
          : `User ${intro.receiverUserId}`
      }
      description={
        <>
          <span>
            {t('introducedBy', {
              tutor:
                intro.tutorUser?.username ||
                (intro.tutorUserId
                  ? `User ${intro.tutorUserId}`
                  : t('unknown')),
            })}
          </span>
          <br />
          <span className="text-xs text-gray-400">
            {new Date(intro.completedAt).toLocaleDateString()}
          </span>
        </>
      }
      avatarProps={{
        showFallback: true,
        fallback: (intro.receiverUser?.username
          ? intro.receiverUser.username[0]
          : intro.receiverUserId.toString()[0]
        ).toUpperCase(),
      }}
    />
  );
};
