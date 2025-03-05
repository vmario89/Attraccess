import { memo } from 'react';
import { Pagination } from '@heroui/react';

interface HistoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const HistoryPagination = memo(
  ({ currentPage, totalPages, onPageChange }: HistoryPaginationProps) => {
    return (
      <div className="flex justify-center mt-4">
        <Pagination
          total={totalPages || 1}
          page={currentPage}
          onChange={onPageChange}
        />
      </div>
    );
  }
);

HistoryPagination.displayName = 'HistoryPagination';
