import { useCallback, useMemo, useState } from 'react';
import { useResources } from '../../api/hooks';
import { ResourceCard, ResourceCardSkeletonLoader } from './resourceCard';
import { Toolbar } from './toolbar';
import { Resource } from '@attraccess/api-client';
import { Alert } from '@heroui/react';

export function ResourceList() {
  const [searchInput, setSearchInput] = useState('');

  const resources = useResources({
    search: searchInput,
  });

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const ResourceCards = useMemo(() => {
    const items = resources.data?.data ?? [];
    return items.map((resource: Resource) => (
      <ResourceCard
        key={resource.id}
        resource={resource}
        href={`/resources/${resource.id}`}
      />
    ));
  }, [resources]);

  const ResourceCardSkeletons = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => (
      <ResourceCardSkeletonLoader key={index} />
    ));
  }, []);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {!hasItems && ResourceCardSkeletons}
        {hasItems && ResourceCards}
      </div>
    );
  }, [resources, ResourceCards, ResourceCardSkeletons]);

  return (
    <>
      <Toolbar onSearch={handleSearch} searchIsLoading={resources.isLoading} />

      {Cards}
    </>
  );
}
