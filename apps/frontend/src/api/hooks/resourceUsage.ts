import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ResourceUsage,
  StartUsageSessionDto,
  EndUsageSessionDto,
} from '@attraccess/api-client';
import { ApiError, createQueryKeys } from './base';
import getApi from '../index';

// Define module-specific query keys with combined implementation
export const resourceUsageKeys = {
  ...createQueryKeys('resourceUsage'),
  // Custom query keys with their implementations
  active: (resourceId: number) =>
    ['resourceUsage', 'active', resourceId] as const,
  history: (
    resourceId: number,
    params?: { page?: number; limit?: number; showAllUsers?: boolean }
  ) => ['resourceUsage', 'history', resourceId, params || {}] as const,
};

// Get active session for current user on a specific resource
export function useActiveSession(resourceId: number) {
  return useQuery({
    queryKey: resourceUsageKeys.active(resourceId),
    queryFn: async () => {
      const api = getApi();

      try {
        const response =
          await api.resourceUsage.resourceUsageControllerGetActiveSession(
            resourceId
          );
        return response.data;
      } catch (error) {
        console.error('Error fetching active session:', error);
        return null;
      }
    },
    enabled: !!resourceId,
  });
}

// Start a new usage session
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation<
    ResourceUsage,
    ApiError,
    { resourceId: number; dto: StartUsageSessionDto }
  >({
    mutationFn: async ({ resourceId, dto }) => {
      const api = getApi();
      const response =
        await api.resourceUsage.resourceUsageControllerStartSession(
          resourceId,
          dto
        );
      return response.data;
    },
    onSuccess: (_, { resourceId }) => {
      // Invalidate active session query
      queryClient.invalidateQueries({
        queryKey: resourceUsageKeys.active(resourceId),
      });

      // Invalidate resource history
      queryClient.invalidateQueries({
        queryKey: resourceUsageKeys.history(resourceId),
      });
    },
  });
}

// End an active usage session
export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation<
    ResourceUsage,
    ApiError,
    { resourceId: number; dto: EndUsageSessionDto }
  >({
    mutationFn: async ({ resourceId, dto }) => {
      const api = getApi();
      const response =
        await api.resourceUsage.resourceUsageControllerEndSession(
          resourceId,
          dto
        );
      return response.data;
    },
    onSuccess: (_, { resourceId }) => {
      // Invalidate active session query
      queryClient.invalidateQueries({
        queryKey: resourceUsageKeys.active(resourceId),
      });

      // Invalidate resource history
      queryClient.invalidateQueries({
        queryKey: resourceUsageKeys.history(resourceId),
      });
    },
  });
}

// Get resource usage history with pagination
export function useResourceUsageHistory(
  resourceId: number,
  page = 1,
  limit = 10,
  showAllUsers = false
) {
  return useQuery({
    queryKey: resourceUsageKeys.history(resourceId, {
      page,
      limit,
      showAllUsers,
    }),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.resourceUsage.resourceUsageControllerGetResourceHistory({
          resourceId,
          page,
          limit,
          // Only add showAllUsers if it's relevant to the API
          ...(showAllUsers && { userId: undefined }), // If showAllUsers is true, we don't filter by userId
        });
      return response.data;
    },
    enabled: !!resourceId && page > 0 && limit > 0,
  });
}
