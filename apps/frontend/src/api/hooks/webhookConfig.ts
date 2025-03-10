import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreateWebhookConfigDto,
  UpdateWebhookConfigDto,
  WebhookConfigResponseDto,
  WebhookTestResponseDto,
} from '@attraccess/api-client';
import { ApiError, createQueryKeys } from './base';
import getApi from '../index';

// Define webhook query keys
export const webhookConfigKeys = {
  ...createQueryKeys('webhook-config'),
  byResource: (resourceId: number) =>
    ['webhook-config', 'resource', resourceId] as const,
  byId: (resourceId: number, id: number) =>
    ['webhook-config', 'resource', resourceId, id] as const,
};

// Get all webhook configs for a resource
export function useWebhookConfigs(resourceId: number) {
  return useQuery({
    queryKey: webhookConfigKeys.byResource(resourceId),
    queryFn: async () => {
      const api = await getApi();
      const response = await api.webhooks.webhookConfigControllerFindAll(
        resourceId
      );
      return response.data;
    },
    enabled: !!resourceId,
  });
}

// Get webhook config by ID
export function useWebhookConfig(resourceId: number, id: number) {
  return useQuery({
    queryKey: webhookConfigKeys.byId(resourceId, id),
    queryFn: async () => {
      const api = await getApi();
      const response = await api.webhooks.webhookConfigControllerFindById(
        resourceId,
        id
      );
      return response.data;
    },
    enabled: !!resourceId && !!id,
  });
}

// Create webhook config
export function useCreateWebhookConfig() {
  const queryClient = useQueryClient();

  return useMutation<
    WebhookConfigResponseDto,
    ApiError,
    { resourceId: number; data: CreateWebhookConfigDto }
  >({
    mutationFn: async ({ resourceId, data }) => {
      const api = await getApi();
      const response = await api.webhooks.webhookConfigControllerCreate(
        resourceId,
        data
      );
      return response.data;
    },
    onSuccess: (_, { resourceId }) => {
      // Invalidate the webhook configs list query
      queryClient.invalidateQueries({
        queryKey: webhookConfigKeys.byResource(resourceId),
      });
    },
  });
}

// Update webhook config
export function useUpdateWebhookConfig() {
  const queryClient = useQueryClient();

  return useMutation<
    WebhookConfigResponseDto,
    ApiError,
    { resourceId: number; id: number; data: UpdateWebhookConfigDto }
  >({
    mutationFn: async ({ resourceId, id, data }) => {
      const api = await getApi();
      const response = await api.webhooks.webhookConfigControllerUpdate(
        resourceId,
        id,
        data
      );
      return response.data;
    },
    onSuccess: (_, { resourceId, id }) => {
      // Invalidate both the specific webhook config and the list
      queryClient.invalidateQueries({
        queryKey: webhookConfigKeys.byId(resourceId, id),
      });
      queryClient.invalidateQueries({
        queryKey: webhookConfigKeys.byResource(resourceId),
      });
    },
  });
}

// Delete webhook config
export function useDeleteWebhookConfig() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { resourceId: number; id: number }>({
    mutationFn: async ({ resourceId, id }) => {
      const api = await getApi();
      await api.webhooks.webhookConfigControllerDelete(resourceId, id);
    },
    onSuccess: (_, { resourceId }) => {
      // Invalidate the webhook configs list query
      queryClient.invalidateQueries({
        queryKey: webhookConfigKeys.byResource(resourceId),
      });
    },
  });
}

// Update webhook status
export function useUpdateWebhookStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    WebhookConfigResponseDto,
    ApiError,
    { resourceId: number; id: number; active: boolean }
  >({
    mutationFn: async ({ resourceId, id, active }) => {
      const api = await getApi();
      const response = await api.webhooks.webhookConfigControllerUpdateStatus(
        resourceId,
        id,
        { active }
      );
      return response.data;
    },
    onSuccess: (_, { resourceId, id }) => {
      // Invalidate both the specific webhook config and the list
      queryClient.invalidateQueries({
        queryKey: webhookConfigKeys.byId(resourceId, id),
      });
      queryClient.invalidateQueries({
        queryKey: webhookConfigKeys.byResource(resourceId),
      });
    },
  });
}

// Test webhook
export function useTestWebhook() {
  return useMutation<
    WebhookTestResponseDto,
    ApiError,
    { resourceId: number; id: number }
  >({
    mutationFn: async ({ resourceId, id }) => {
      const api = await getApi();
      const response = await api.webhooks.webhookConfigControllerTestWebhook(
        resourceId,
        id
      );
      return response.data;
    },
  });
}

// Regenerate webhook secret
export function useRegenerateWebhookSecret() {
  const queryClient = useQueryClient();

  return useMutation<
    WebhookConfigResponseDto,
    ApiError,
    { resourceId: number; id: number }
  >({
    mutationFn: async ({ resourceId, id }) => {
      const api = await getApi();
      const response =
        await api.webhooks.webhookConfigControllerRegenerateSecret(
          resourceId,
          id
        );
      return response.data;
    },
    onSuccess: (_, { resourceId, id }) => {
      // Invalidate both the specific webhook config and the list
      queryClient.invalidateQueries({
        queryKey: webhookConfigKeys.byId(resourceId, id),
      });
      queryClient.invalidateQueries({
        queryKey: webhookConfigKeys.byResource(resourceId),
      });
    },
  });
}
