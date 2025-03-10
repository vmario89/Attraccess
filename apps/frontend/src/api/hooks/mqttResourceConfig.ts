import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateMqttResourceConfigDto,
  MqttResourceConfig,
} from '@attraccess/api-client';
import { ApiError, createQueryKeys } from './base';
import getApi from '../index';

// Define module-specific query keys
export const mqttResourceConfigKeys = {
  ...createQueryKeys('mqtt-resource-config'),
  byResource: (resourceId: number) =>
    ['mqtt-resource-config', 'resource', resourceId] as const,
};

// Get MQTT config for a resource
export function useMqttResourceConfig(resourceId: number) {
  return useQuery({
    queryKey: mqttResourceConfigKeys.byResource(resourceId),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.mqttResourceConfiguration.mqttResourceConfigControllerGetMqttConfig(
          resourceId
        );
      return response.data;
    },
    enabled: !!resourceId,
  });
}

// Create or update MQTT config
export function useCreateOrUpdateMqttResourceConfig() {
  const queryClient = useQueryClient();

  return useMutation<
    MqttResourceConfig,
    ApiError,
    { resourceId: number; data: CreateMqttResourceConfigDto }
  >({
    mutationFn: async ({ resourceId, data }) => {
      const api = getApi();
      const response =
        await api.mqttResourceConfiguration.mqttResourceConfigControllerCreateOrUpdateMqttConfig(
          resourceId,
          data
        );
      return response.data;
    },
    onSuccess: (_, { resourceId }) => {
      queryClient.invalidateQueries({
        queryKey: mqttResourceConfigKeys.byResource(resourceId),
      });
    },
  });
}

// Delete MQTT config
export function useDeleteMqttResourceConfig() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: async (resourceId) => {
      const api = getApi();
      await api.mqttResourceConfiguration.mqttResourceConfigControllerDeleteMqttConfig(
        resourceId
      );
    },
    onSuccess: (_, resourceId) => {
      queryClient.invalidateQueries({
        queryKey: mqttResourceConfigKeys.byResource(resourceId),
      });
    },
  });
}

// Test MQTT config
export function useTestMqttResourceConfig() {
  return useMutation<{ success: boolean; message: string }, ApiError, number>({
    mutationFn: async (resourceId) => {
      const api = getApi();
      const response =
        await api.mqttResourceConfiguration.mqttResourceConfigControllerTestMqttConfig(
          resourceId
        );
      return response.data;
    },
  });
}
