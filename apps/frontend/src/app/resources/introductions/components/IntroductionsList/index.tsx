import { ResourceIntroduction } from '@attraccess/api-client';
import { IntroductionItem } from '../IntroductionItem';
import { useTranslations } from '../../../../../i18n';
import * as en from './translations/en';
import * as de from './translations/de';

export type IntroductionsListProps = {
  introductions: ResourceIntroduction[];
};

export const IntroductionsList = ({
  introductions,
}: IntroductionsListProps) => {
  const { t } = useTranslations('introductionsList', {
    en,
    de,
  });

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">{t('existingIntroductions')}</h3>

      {introductions?.length ? (
        <div className="space-y-3 space-x-3">
          {introductions.map((intro) => (
            <IntroductionItem key={intro.id} introduction={intro} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 py-4 text-center italic">
          {t('noIntroductions')}
        </p>
      )}
    </div>
  );
};
