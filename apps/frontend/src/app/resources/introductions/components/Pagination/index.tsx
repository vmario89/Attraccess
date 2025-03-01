import { Button } from '@heroui/button';
import { CardFooter } from '@heroui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from '../../../../../i18n';
import * as en from './translations/en';
import * as de from './translations/de';

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
};

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onNextPage,
  onPreviousPage,
}: PaginationProps) => {
  const { t } = useTranslations('pagination', {
    en,
    de,
  });

  return (
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
          onPress={onPreviousPage}
          startContent={<ChevronLeft className="w-4 h-4" />}
        >
          {t('pagination.previous')}
        </Button>
        <Button
          variant="light"
          size="sm"
          isDisabled={currentPage >= totalPages}
          onPress={onNextPage}
          endContent={<ChevronRight className="w-4 h-4" />}
        >
          {t('pagination.next')}
        </Button>
      </div>
    </CardFooter>
  );
};
