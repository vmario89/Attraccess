// eslint-disable-next-line @nx/enforce-module-boundaries
import { useResourceIntroducers } from '@frontend/api/hooks/resourceIntroduction';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useTranslations } from '@frontend/i18n';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Divider } from '@heroui/divider';
import { AddIntroducer } from './components/AddIntroducer';
import { IntroducersList } from './components/IntroducersList';
import * as en from './translations/en';
import * as de from './translations/de';

export type ManageIntroducersProps = {
  resourceId: number;
};

export function ManageIntroducers({ resourceId }: ManageIntroducersProps) {
  const { t } = useTranslations('manageIntroducers', {
    en,
    de,
  });

  // Get current introducers
  const { data: introducers, isLoading: isLoadingIntroducers } =
    useResourceIntroducers(resourceId);

  if (isLoadingIntroducers) {
    return (
      <Card>
        <CardBody>
          <div className="flex justify-center p-4">
            <Spinner size="md" />
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-start gap-1">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t('description')}</p>
      </CardHeader>

      <CardBody className="space-y-4">
        <AddIntroducer resourceId={resourceId} />

        {introducers && introducers.length > 0 ? (
          <>
            <Divider className="my-4" />
            <h3 className="text-lg font-medium mb-2 dark:text-white">
              {t('currentIntroducers')}
            </h3>
            <IntroducersList resourceId={resourceId} />
          </>
        ) : (
          <div className="text-center p-4 mt-4 bg-gray-50 rounded-md dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              {t('noIntroducers')}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
