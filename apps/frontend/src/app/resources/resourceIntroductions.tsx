import { useState } from 'react';
import {
  useResourceIntroductions,
  useCompleteIntroduction,
  useResourceIntroducers,
} from '../../api/hooks/resourceIntroduction';
import { ResourceIntroduction } from '@attraccess/api-client';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { useToastMessage } from '../../components/toastProvider';
import { useAuth } from '../../hooks/useAuth';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslations } from '../../i18n';
import * as en from './translations/resourceIntroductions.en';
import * as de from './translations/resourceIntroductions.de';
import { Card, CardBody, CardHeader, CardFooter } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { User as UserComponent } from '@heroui/user';
import { Skeleton } from '@heroui/skeleton';

export function ResourceIntroductions({ resourceId }: { resourceId: number }) {
  const { t } = useTranslations('resourceIntroductions', {
    en,
    de,
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
        title: t('error.emptyIdentifier.title'),
        description: t('error.emptyIdentifier.description'),
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
        title: t('success.title'),
        description: t('success.description', { user: userIdentifier }),
      });
    } catch (err) {
      showError({
        title: t('error.addFailed.title'),
        description: t('error.addFailed.description'),
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
    return (
      <Card>
        <CardBody>
          <Skeleton className="h-8 w-3/4 rounded-lg mb-4" />
          <Skeleton className="h-6 w-1/2 rounded-lg mb-4" />
          <Skeleton className="h-10 w-full rounded-lg mb-4" />
          <Skeleton className="h-6 w-1/2 rounded-lg mb-2" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </CardBody>
      </Card>
    );
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
        <h2 className="text-xl font-semibold">{t('title')}</h2>
      </CardHeader>

      <CardBody>
        {/* Add new introduction */}

        <form
          className="mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddIntroduction();
          }}
        >
          <Input
            value={userIdentifier}
            onChange={(e) => setUserIdentifier(e.target.value)}
            className="flex-1"
            label={t('addNew.label')}
            endContent={completeIntroduction.isPending ? <Loader2 /> : null}
          />
        </form>

        <Divider className="my-4" />

        {/* List of users with introductions */}
        <div>
          <h3 className="text-lg font-medium mb-2">
            {t('existingIntroductions')}
          </h3>

          {introductions?.length ? (
            <div className="space-y-3">
              {introductions.map((intro) => (
                <UserComponent
                  key={intro.id}
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
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center italic">
              {t('noIntroductions')}
            </p>
          )}
        </div>
      </CardBody>

      {/* Add pagination controls */}
      {totalItems > 0 && (
        <CardFooter className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-500">
            {t('pagination.showing', {
              start: Math.min((currentPage - 1) * pageSize + 1, totalItems),
              end: Math.min(currentPage * pageSize, totalItems),
              total: totalItems,
            })}
          </div>
          <div className="flex gap-2">
            <Button
              variant="light"
              size="sm"
              isDisabled={currentPage === 1}
              onPress={handlePreviousPage}
              startContent={<ChevronLeft className="w-4 h-4" />}
            >
              {t('pagination.previous')}
            </Button>
            <Button
              variant="light"
              size="sm"
              isDisabled={currentPage >= totalPages}
              onPress={handleNextPage}
              endContent={<ChevronRight className="w-4 h-4" />}
            >
              {t('pagination.next')}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
