import { useCallback, useMemo, useState } from 'react';
import { useResources } from '../../api/hooks';
import { ResourceCard, ResourceCardSkeletonLoader } from './resourceCard';
import { Toolbar } from './toolbar';
import { Resource } from '@attraccess/api-client';
import { Alert, Pagination } from '@heroui/react';

export function ResourceList() {
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // 3x3 grid for desktop

  const resources = useResources({
    search: searchInput,
    page: currentPage,
    limit: pageSize,
  });

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    setCurrentPage(1); // Reset to first page on new search
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const ResourceCards = useMemo(() => {
    const items = resources.data?.data ?? [];
    return items.map((resource: Resource) => (
      <ResourceCard
        key={resource.id}
        resource={resource}
        href={`/resources/${resource.id}`}
        fullWidth
      />
    ));
  }, [resources]);

  const ResourceCardSkeletons = useMemo(() => {
    return Array.from({ length: pageSize }, (_, index) => (
      <ResourceCardSkeletonLoader key={index} />
    ));
  }, [pageSize]);

  const Cards = useMemo(() => {
    const hasItems = (resources.data?.data.length || 0) > 0;

    if (resources.isError) {
      return (
        <Alert
          description={resources.error?.message}
          title="Error loading resources"
          color="danger"
        />
      );
    }

    if (!resources.isLoading && !hasItems) {
      return <Alert title="No resources found" color="warning" />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.isLoading ? ResourceCardSkeletons : ResourceCards}
      </div>
    );
  }, [resources, ResourceCards, ResourceCardSkeletons]);

  const totalPages = useMemo(() => {
    const total = resources.data?.total ?? 0;
    return Math.ceil(total / pageSize);
  }, [resources.data?.total, pageSize]);

  return (
    <>
      <Toolbar onSearch={handleSearch} searchIsLoading={resources.isLoading} />

      {Cards}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            total={totalPages}
            initialPage={currentPage}
            onChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}
