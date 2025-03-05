import { useResourceIntroducers } from '../../../../api/hooks/resourceIntroduction';
import { useAuth } from '../../../../hooks/useAuth';
import { useMemo } from 'react';

export function useCanManageIntroductions(resourceId: number) {
  const { user } = useAuth();

  const { data: introducers, isLoading } = useResourceIntroducers(resourceId);

  const canManageIntroductions = useMemo(
    () => !!introducers?.some((introducer) => introducer.userId === user?.id),
    [introducers, user?.id]
  );

  return { canManageIntroductions, isLoading };
}
