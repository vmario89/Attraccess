import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ResourceUsage,
  StartUsageSessionDto,
  EndUsageSessionDto,
} from '@attraccess/api-client';
import { queryKeys } from './base';
import getApi from '../index';
import { useAuth } from '../../hooks/useAuth';

interface ResourceUsageError {
  message: string;
  statusCode: number;
}

// Get active session for current user on a specific resource
export function useActiveSession(resourceId: number) {
  return useQuery({
    queryKey: queryKeys.resourceUsage.active(resourceId),
    queryFn: async () => {
      console.log('Fetching active session for resource:', resourceId);
      const api = getApi();

      try {
        const response =
          await api.resourceUsage.resourceUsageControllerGetActiveSession(
            resourceId
          );
        console.log('Active session API response:', response);
        return response.data;
      } catch (error) {
        console.error('Error fetching active session:', error);
        throw error;
      }
    },
    enabled: !!resourceId,
    // Check every 10 seconds to update session duration display
    refetchInterval: 10000,
    // Always fetch fresh data
    staleTime: 0,
    // Keep the data in cache for a reasonable time
    gcTime: 30000,
  });
}

// Start a new session
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation<
    ResourceUsage,
    ResourceUsageError,
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.resourceUsage.active(resourceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.resources.detail(resourceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.resourceUsage.history(resourceId),
      });
    },
  });
}

// End an active session
export function useEndSession() {
  const queryClient = useQueryClient();

  return useMutation<
    ResourceUsage,
    ResourceUsageError,
    { resourceId: number; dto: EndUsageSessionDto }
  >({
    mutationFn: async ({ resourceId, dto }) => {
      console.log('Making API call to end session for resource:', resourceId);
      const api = getApi();

      try {
        const response =
          await api.resourceUsage.resourceUsageControllerEndSession(
            resourceId,
            dto
          );
        console.log('End session API response:', response);
        return response.data;
      } catch (error) {
        console.error('API error when ending session:', error);
        throw error;
      }
    },
    onSuccess: (data, { resourceId }) => {
      console.log('Session ended successfully, invalidating queries', data);
      queryClient.invalidateQueries({
        queryKey: queryKeys.resourceUsage.active(resourceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.resources.detail(resourceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.resourceUsage.history(resourceId),
      });
    },
  });
}

// Get usage history for a resource
export function useResourceUsageHistory(
  resourceId: number,
  page = 1,
  limit = 10,
  showAllUsers = false
) {
  const { hasPermission, user } = useAuth();
  const canManageResources = hasPermission('canManageResources');

  return useQuery({
    queryKey: [
      ...queryKeys.resourceUsage.history(resourceId),
      page,
      limit,
      showAllUsers,
    ],
    queryFn: async () => {
      const api = getApi();

      try {
        // Determine if we should filter by userId
        // - If user doesn't have manage permission, always filter by their ID
        // - If user has manage permission but doesn't want to see all users, filter by their ID
        // - If user has manage permission and wants to see all users, don't filter
        const shouldFilterByUser = !canManageResources || !showAllUsers;
        const queryParams = {
          resourceId,
          page,
          limit,
          ...(shouldFilterByUser && user ? { userId: user.id } : {}),
        };

        const response =
          await api.resourceUsage.resourceUsageControllerGetResourceHistory(
            queryParams
          );
        return response.data;
      } catch (error) {
        console.error('Error fetching usage history:', error);
        throw error;
      }
    },
    enabled: !!resourceId,
    // Ensure we always get fresh data for the history
    staleTime: 0,
    // Keep the data in cache for a reasonable time
    gcTime: 30000,
  });
}
