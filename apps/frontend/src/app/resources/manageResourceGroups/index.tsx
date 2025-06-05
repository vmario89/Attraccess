import { useMemo } from 'react';
import { useResourcesServiceGetOneResourceById } from '@attraccess/react-query-client';
import { CurrentGroups } from './CurrentGroups';
import { GroupSearch } from './GroupSearch';

interface ManageResourceGroupsProps {
  resourceId: number;
}

export function ManageResourceGroups({ resourceId }: Readonly<ManageResourceGroupsProps>) {
  const { data: resource } = useResourcesServiceGetOneResourceById({ id: resourceId });

  const currentGroupIds = useMemo(() => {
    const groups = resource?.groups ?? [];
    return new Set(groups.map((g) => g.id));
  }, [resource]);

  return (
    <div className="flex flex-col gap-4">
      <CurrentGroups resourceId={resourceId} />
      <GroupSearch resourceId={resourceId} excludeGroupIds={currentGroupIds} />
    </div>
  );
}
