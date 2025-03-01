import { useState } from 'react';
import {
  useResourceIntroductions,
  useCompleteIntroduction,
  useResourceIntroducers,
} from '../../../api/hooks/resourceIntroduction';
import { ResourceIntroduction } from '@attraccess/api-client';
import { useToastMessage } from '../../../components/toastProvider';
import { useAuth } from '../../../hooks/useAuth';
import { useTranslations } from '../../../i18n';
import * as mainEn from './translations/resourceIntroductions.en';
import * as mainDe from './translations/resourceIntroductions.de';
import * as formEn from './components/AddIntroductionForm/translations/en';
import * as formDe from './components/AddIntroductionForm/translations/de';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import {
  IntroductionsSkeleton,
  AddIntroductionForm,
  IntroductionsList,
  Pagination,
} from './components';

// Main component
export function ResourceIntroductions({ resourceId }: { resourceId: number }) {
  const { t: mainT } = useTranslations('resourceIntroductions', {
    en: mainEn,
    de: mainDe,
  });

  const { t: formT } = useTranslations('addIntroductionForm', {
    en: formEn,
    de: formDe,
  });

  const { user } = useAuth();
  const [userIdentifier, setUserIdentifier] = useState('');
  const { success, error: showError } = useToastMessage();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const {
    data: introductionsData,
    isLoading: isLoadingIntroductions,
    refetch: refetchIntroductions,
  } = useResourceIntroductions(resourceId, {
    page: currentPage,
    limit: pageSize,
  });

  // Get the list of users who can give introductions and verify the current user is in that list
  const { data: introducers, isLoading: isLoadingIntroducers } =
    useResourceIntroducers(resourceId);
  const canGiveIntroductions = !!introducers?.some(
    (introducer) => introducer.userId === user?.id
  );

  const completeIntroduction = useCompleteIntroduction();

  const handleAddIntroduction = async () => {
    if (!userIdentifier.trim()) {
      showError({
        title: formT('error.emptyIdentifier.title'),
        description: formT('error.emptyIdentifier.description'),
      });
      return;
    }

    try {
      await completeIntroduction.mutateAsync({
        resourceId,
        userIdentifier,
      });

      // Directly refetch the data to immediately update the UI
      refetchIntroductions();

      // Reset form
      setUserIdentifier('');

      // Show success message
      success({
        title: formT('success.title'),
        description: formT('success.description', { user: userIdentifier }),
      });
    } catch (err) {
      showError({
        title: formT('error.addFailed.title'),
        description: formT('error.addFailed.description'),
      });
      console.error('Failed to add introduction:', err);
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    if (introductionsData && currentPage < introductionsData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoadingIntroductions || isLoadingIntroducers) {
    return <IntroductionsSkeleton />;
  }

  // If the user is not authorized to give introductions, don't render anything
  if (!canGiveIntroductions) {
    return null;
  }

  // Extract the actual introductions array from the paginated response
  const introductions: ResourceIntroduction[] = introductionsData?.data || [];
  const totalItems = introductionsData?.total || 0;
  const totalPages = introductionsData?.totalPages || 1;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{mainT('title')}</h2>
      </CardHeader>

      <CardBody>
        {/* Add new introduction */}
        <AddIntroductionForm
          userIdentifier={userIdentifier}
          setUserIdentifier={setUserIdentifier}
          onSubmit={handleAddIntroduction}
          isSubmitting={completeIntroduction.isPending}
        />

        <Divider className="my-4" />

        {/* List of users with introductions */}
        <IntroductionsList introductions={introductions} />
      </CardBody>

      {/* Add pagination controls */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
        />
      )}
    </Card>
  );
}
