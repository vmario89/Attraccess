import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ResourceIntroduction,
  ResourceIntroductionHistoryItem,
  ResourceIntroductionUser,
} from '@attraccess/api-client';
import { baseQueryKeys } from './base';
import getApi from '../index';

interface ResourceIntroductionError {
  message: string;
  statusCode: number;
}

// Check if the current user has completed the introduction for a resource
export function useCheckIntroductionStatus(resourceId: number) {
  return useQuery({
    queryKey: baseQueryKeys.resourceIntroduction.status(resourceId),
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

// Get list of users who can give introductions for a resource
export function useResourceIntroducers(resourceId: number) {
  return useQuery({
    queryKey: baseQueryKeys.resourceIntroduction.introducers(resourceId),
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
    queryKey: baseQueryKeys.resourceIntroduction.list(resourceId, {
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
        queryKey: baseQueryKeys.resourceIntroduction.list(resourceId),
      });

      // Also invalidate the introduction status as it may have changed
      queryClient.invalidateQueries({
        queryKey: baseQueryKeys.resourceIntroduction.status(resourceId),
      });

      // Invalidate all resource introducers as well to ensure consistency
      queryClient.invalidateQueries({
        queryKey: baseQueryKeys.resourceIntroduction.introducers(resourceId),
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
    queryKey: baseQueryKeys.resourceIntroduction.revokedStatus(
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
    queryKey: baseQueryKeys.resourceIntroduction.history(
      resourceId,
      introductionId
    ),
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
        queryKey: baseQueryKeys.resourceIntroduction.list(resourceId),
      });

      // Invalidate the revoked status query
      queryClient.invalidateQueries({
        queryKey: baseQueryKeys.resourceIntroduction.revokedStatus(
          resourceId,
          introductionId
        ),
      });

      // Invalidate the history query
      queryClient.invalidateQueries({
        queryKey: baseQueryKeys.resourceIntroduction.history(
          resourceId,
          introductionId
        ),
      });

      // Also invalidate the introduction status for any user that might be affected
      queryClient.invalidateQueries({
        queryKey: baseQueryKeys.resourceIntroduction.status(resourceId),
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
        queryKey: baseQueryKeys.resourceIntroduction.list(resourceId),
      });

      // Invalidate the revoked status query
      queryClient.invalidateQueries({
        queryKey: baseQueryKeys.resourceIntroduction.revokedStatus(
          resourceId,
          introductionId
        ),
      });

      // Invalidate the history query
      queryClient.invalidateQueries({
        queryKey: baseQueryKeys.resourceIntroduction.history(
          resourceId,
          introductionId
        ),
      });

      // Also invalidate the introduction status for any user that might be affected
      queryClient.invalidateQueries({
        queryKey: baseQueryKeys.resourceIntroduction.status(resourceId),
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
        queryKey: baseQueryKeys.resourceIntroduction.introducers(resourceId),
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
        queryKey: baseQueryKeys.resourceIntroduction.introducers(resourceId),
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
    queryKey: baseQueryKeys.resourceIntroduction.detail(
      resourceId,
      introductionId
    ),
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
    queryKey:
      baseQueryKeys.resourceIntroduction.canManageIntroductions(resourceId),
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
    queryKey:
      baseQueryKeys.resourceIntroduction.canManageIntroducers(resourceId),
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
