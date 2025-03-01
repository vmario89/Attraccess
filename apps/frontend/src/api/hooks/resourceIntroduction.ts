import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ResourceIntroduction } from '@attraccess/api-client';
import { queryKeys } from './base';
import getApi from '../index';

interface ResourceIntroductionError {
  message: string;
  statusCode: number;
}

// Check if the current user has completed the introduction for a resource
export function useCheckIntroductionStatus(resourceId: number) {
  return useQuery({
    queryKey: queryKeys.resourceIntroduction.status(resourceId),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerCheckIntroductionStatus(
          resourceId
        );
      return response.data;
    },
    enabled: !!resourceId,
  });
}

// Get list of users who can give introductions for a resource
export function useResourceIntroducers(resourceId: number) {
  return useQuery({
    queryKey: queryKeys.resourceIntroduction.introducers(resourceId),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerGetResourceIntroducers(
          resourceId
        );
      return response.data;
    },
    enabled: !!resourceId,
  });
}

// Get list of introductions for a resource
export function useResourceIntroductions(
  resourceId: number,
  options?: { page?: number; limit?: number }
) {
  const page = options?.page || 1;
  const limit = options?.limit || 10;

  return useQuery({
    queryKey: queryKeys.resourceIntroduction.list(resourceId, { page, limit }),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerGetResourceIntroductions(
          { resourceId, page, limit }
        );
      return response.data;
    },
    enabled: !!resourceId,
  });
}

// Add a new introduction by providing the user ID
export function useCompleteIntroduction() {
  const queryClient = useQueryClient();

  return useMutation<
    ResourceIntroduction,
    ResourceIntroductionError,
    { resourceId: number; userId?: number; userIdentifier?: string }
  >({
    mutationFn: async ({ resourceId, userId, userIdentifier }) => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerCompleteIntroduction(
          resourceId,
          { userId, userIdentifier }
        );
      return response.data;
    },
    onSuccess: (data, { resourceId }) => {
      // Invalidate the list of introductions for this resource
      queryClient.invalidateQueries({
        queryKey: queryKeys.resourceIntroduction.list(resourceId),
      });

      // Also invalidate the introduction status as it may have changed
      queryClient.invalidateQueries({
        queryKey: queryKeys.resourceIntroduction.status(resourceId),
      });

      // Invalidate all resource introducers as well to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.resourceIntroduction.introducers(resourceId),
      });
    },
  });
}
