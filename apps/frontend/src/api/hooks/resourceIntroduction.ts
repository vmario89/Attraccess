import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ResourceIntroduction,
  ResourceIntroductionHistoryItem,
  ResourceIntroductionUser,
} from '@attraccess/api-client';
import { createQueryKeys } from './base';
import getApi from '../index';

// Define module-specific query keys with all functions defined inline
export const resourceIntroductionKeys = {
  ...createQueryKeys('resourceIntroduction'),
  // Custom query keys with their implementations
  status: (resourceId: number) =>
    ['resourceIntroduction', 'status', resourceId] as const,
  introducers: (resourceId: number) =>
    ['resourceIntroduction', 'introducers', resourceId] as const,
  list: (resourceId: number, params?: { page?: number; limit?: number }) =>
    ['resourceIntroduction', 'list', resourceId, params || {}] as const,
  history: (resourceId: number, introductionId: number) =>
    ['resourceIntroduction', 'history', resourceId, introductionId] as const,
  revokedStatus: (resourceId: number, introductionId: number) =>
    [
      'resourceIntroduction',
      'revokedStatus',
      resourceId,
      introductionId,
    ] as const,
  // Override the basic detail key with our custom implementation
  detail: (resourceId: number, introductionId?: number) =>
    introductionId
      ? ([
          'resourceIntroduction',
          'detail',
          resourceId,
          introductionId,
        ] as const)
      : (['resourceIntroduction', 'detail', resourceId] as const),
  canManageIntroductions: (resourceId: number) =>
    ['resourceIntroduction', 'canManageIntroductions', resourceId] as const,
  canManageIntroducers: (resourceId: number) =>
    ['resourceIntroduction', 'canManageIntroducers', resourceId] as const,
};

interface ResourceIntroductionError {
  message: string;
  statusCode: number;
}

// Check if the current user has completed the introduction for a resource
export function useCheckIntroductionStatus(resourceId: number) {
  return useQuery({
    queryKey: resourceIntroductionKeys.status(resourceId),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerCheckIntroductionStatus(
          resourceId
        );
      return response.data.hasValidIntroduction;
    },
    enabled: !!resourceId,
  });
}

// Get list of users who can introduce others to a resource
export function useResourceIntroducers(resourceId: number) {
  return useQuery({
    queryKey: resourceIntroductionKeys.introducers(resourceId),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.resourceIntroducers.resourceIntroducersControllerGetResourceIntroducers(
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
    queryKey: resourceIntroductionKeys.list(resourceId, {
      page,
      limit,
    }),
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
    { resourceId: number; userId: number }
  >({
    mutationFn: async ({ resourceId, userId }) => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerCompleteIntroduction(
          resourceId,
          { userId }
        );
      return response.data;
    },
    onSuccess: (data, { resourceId }) => {
      // Invalidate the list of introductions for this resource
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.list(resourceId),
      });

      // Also invalidate the introduction status as it may have changed
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.status(resourceId),
      });

      // Invalidate all resource introducers as well to ensure consistency
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.introducers(resourceId),
      });
    },
  });
}

// Check if an introduction is revoked
export function useCheckIntroductionRevokedStatus(
  resourceId: number,
  introductionId: number
) {
  return useQuery({
    queryKey: resourceIntroductionKeys.revokedStatus(
      resourceId,
      introductionId
    ),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerCheckIntroductionRevokedStatus(
          resourceId,
          introductionId
        );
      return response.data;
    },
    enabled: !!resourceId && !!introductionId,
  });
}

// Get history of an introduction
export function useIntroductionHistory(
  resourceId: number,
  introductionId: number
) {
  return useQuery({
    queryKey: resourceIntroductionKeys.history(resourceId, introductionId),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerGetIntroductionHistory(
          resourceId,
          introductionId
        );
      return response.data;
    },
    enabled: !!resourceId && !!introductionId,
  });
}

// Revoke an introduction
export function useRevokeIntroduction() {
  const queryClient = useQueryClient();

  return useMutation<
    ResourceIntroductionHistoryItem,
    ResourceIntroductionError,
    { resourceId: number; introductionId: number; comment?: string }
  >({
    mutationFn: async ({ resourceId, introductionId, comment }) => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerRevokeIntroduction(
          resourceId,
          introductionId,
          { comment }
        );
      return response.data;
    },
    onSuccess: (data, { resourceId, introductionId }) => {
      // Invalidate the list of introductions for this resource
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.list(resourceId),
      });

      // Invalidate the revoked status query
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.revokedStatus(
          resourceId,
          introductionId
        ),
      });

      // Invalidate the history query
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.history(resourceId, introductionId),
      });

      // Also invalidate the introduction status for any user that might be affected
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.status(resourceId),
      });
    },
  });
}

// Unrevoke an introduction
export function useUnrevokeIntroduction() {
  const queryClient = useQueryClient();

  return useMutation<
    ResourceIntroductionHistoryItem,
    ResourceIntroductionError,
    { resourceId: number; introductionId: number; comment?: string }
  >({
    mutationFn: async ({ resourceId, introductionId, comment }) => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerUnrevokeIntroduction(
          resourceId,
          introductionId,
          { comment }
        );
      return response.data;
    },
    onSuccess: (data, { resourceId, introductionId }) => {
      // Invalidate the list of introductions for this resource
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.list(resourceId),
      });

      // Invalidate the revoked status query
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.revokedStatus(
          resourceId,
          introductionId
        ),
      });

      // Invalidate the history query
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.history(resourceId, introductionId),
      });

      // Also invalidate the introduction status for any user that might be affected
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.status(resourceId),
      });
    },
  });
}

// Add a user as an introducer for a resource
export function useAddIntroducer() {
  const queryClient = useQueryClient();

  return useMutation<
    ResourceIntroductionUser,
    ResourceIntroductionError,
    { resourceId: number; userId: number }
  >({
    mutationFn: async ({ resourceId, userId }) => {
      const api = getApi();
      const response =
        await api.resourceIntroducers.resourceIntroducersControllerAddIntroducer(
          resourceId,
          userId
        );
      return response.data;
    },
    onSuccess: (data, { resourceId }) => {
      // Invalidate the list of introducers for this resource
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.introducers(resourceId),
      });
    },
  });
}

// Remove a user as an introducer from a resource
export function useRemoveIntroducer() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ResourceIntroductionError,
    { resourceId: number; userId: number }
  >({
    mutationFn: async ({ resourceId, userId }) => {
      const api = getApi();
      await api.resourceIntroducers.resourceIntroducersControllerRemoveIntroducer(
        resourceId,
        userId
      );
    },
    onSuccess: (_, { resourceId }) => {
      // Invalidate the list of introducers for this resource
      queryClient.invalidateQueries({
        queryKey: resourceIntroductionKeys.introducers(resourceId),
      });
    },
  });
}

// Get a single introduction by ID
export function useResourceIntroduction(
  resourceId: number,
  introductionId: number
) {
  return useQuery({
    queryKey: resourceIntroductionKeys.detail(resourceId, introductionId),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerGetResourceIntroduction(
          resourceId,
          introductionId
        );
      return response.data;
    },
    enabled: !!resourceId && !!introductionId,
  });
}

// Check if the current user can manage introductions for a resource
export function useCanManageIntroductions(resourceId: number) {
  return useQuery({
    queryKey: resourceIntroductionKeys.canManageIntroductions(resourceId),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.resourceIntroductions.resourceIntroductionControllerCanManageIntroductions(
          resourceId
        );
      return response.data.canManageIntroductions;
    },
    enabled: !!resourceId,
  });
}

// Check if the current user can manage introducers for a resource
export function useCanManageIntroducers(resourceId: number) {
  return useQuery({
    queryKey: resourceIntroductionKeys.canManageIntroducers(resourceId),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.resourceIntroducers.resourceIntroducersControllerCanManageIntroducers(
          resourceId
        );
      return response.data.canManageIntroducers;
    },
    enabled: !!resourceId,
  });
}
