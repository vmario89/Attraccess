import { useMemo, useState } from 'react';
import { useTranslations } from '../../../i18n';
import * as en from './translations/resourceIntroductions.en';
import * as de from './translations/resourceIntroductions.de';
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Pagination } from '@heroui/pagination';
import {
  IntroductionsSkeleton,
  AddIntroductionForm,
  IntroductionsList,
} from './components';
import { useResourceIntroductionServiceCheckCanManagePermission, useResourceIntroductionServiceGetAllResourceIntroductions } from '@attraccess/react-query-client';

// Main component
export function ResourceIntroductions({ resourceId }: { resourceId: number }) {
  const { t } = useTranslations('resourceIntroductions', {
    en,
    de,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const { data: introductionsData, isLoading: isLoadingIntroductions } =
    useResourceIntroductionServiceGetAllResourceIntroductions({resourceId, limit: pageSize, page: currentPage});

  const {
    data: canManageIntroductions,
    isLoading: isLoadingCanManageIntroductions,
  } = useResourceIntroductionServiceCheckCanManagePermission({resourceId});

  const totalPages = useMemo(
    () => introductionsData?.totalPages || 1,
    [introductionsData]
  );

  if (isLoadingIntroductions || isLoadingCanManageIntroductions) {
    return <IntroductionsSkeleton />;
  }

  if (!canManageIntroductions) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{t('title')}</h2>
      </CardHeader>

      <CardBody>
        <AddIntroductionForm resourceId={resourceId} />

        <Divider className="my-4" />

        <IntroductionsList resourceId={resourceId} />
      </CardBody>

      <CardFooter className="flex justify-center items-center pt-4">
        <Pagination
          total={totalPages}
          page={currentPage}
          showControls
          onChange={setCurrentPage}
        />
      </CardFooter>
    </Card>
  );
}
