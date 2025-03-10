import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateMqttServerDto,
  MqttServer,
  UpdateMqttServerDto,
} from '@attraccess/api-client';
import { ApiError, createQueryKeys } from './base';
import getApi from '../index';

// Define module-specific query keys
export const mqttServerKeys = {
  ...createQueryKeys('mqtt-servers'),
};

// Get all MQTT servers
export function useMqttServers() {
  return useQuery({
    queryKey: mqttServerKeys.list(),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.mqttServers.mqttServerControllerGetMqttServers();
      return response.data;
    },
  });
}

// Get MQTT server by ID
export function useMqttServer(id: number) {
  return useQuery({
    queryKey: mqttServerKeys.detail(id),
    queryFn: async () => {
      const api = getApi();
      const response =
        await api.mqttServers.mqttServerControllerGetMqttServerById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

// Create MQTT server
export function useCreateMqttServer() {
  const queryClient = useQueryClient();

  return useMutation<MqttServer, ApiError, CreateMqttServerDto>({
    mutationFn: async (data) => {
      const api = getApi();
      const response =
        await api.mqttServers.mqttServerControllerCreateMqttServer(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mqttServerKeys.all,
      });
    },
  });
}

// Update MQTT server
export function useUpdateMqttServer() {
  const queryClient = useQueryClient();

  return useMutation<
    MqttServer,
    ApiError,
    { id: number; data: UpdateMqttServerDto }
  >({
    mutationFn: async ({ id, data }) => {
      const api = getApi();
      const response =
        await api.mqttServers.mqttServerControllerUpdateMqttServer(id, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: mqttServerKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: mqttServerKeys.list(),
      });
    },
  });
}

// Delete MQTT server
export function useDeleteMqttServer() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: async (id) => {
      const api = getApi();
      const response =
        await api.mqttServers.mqttServerControllerDeleteMqttServer(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: mqttServerKeys.all,
      });
    },
  });
}

// Test MQTT server connection
export function useTestMqttServerConnection() {
  return useMutation<{ success: boolean; message: string }, ApiError, number>({
    mutationFn: async (id) => {
      try {
        const api = getApi();
        const response =
          await api.mqttServers.mqttServerControllerTestMqttServerConnection(
            id
          );

        // Ensure the response has the expected structure
        const result = response.data || {
          success: false,
          message: 'No response received',
        };

        // Validate the response format
        return {
          success: typeof result.success === 'boolean' ? result.success : false,
          message:
            result.message ||
            (result.success ? 'Connection successful' : 'Connection failed'),
        };
      } catch (error) {
        // Convert any network or API errors to our response format
        const message =
          error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('MQTT connection test error:', message);
        throw new Error(JSON.stringify({ success: false, message }));
      }
    },
  });
}
