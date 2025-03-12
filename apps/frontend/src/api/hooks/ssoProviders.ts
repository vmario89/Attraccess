import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateSSOProviderDto,
  SSOProvider,
  UpdateSSOProviderDto,
} from '@attraccess/api-client';
import { ApiError, createQueryKeys, QueryConfig } from './base';
import getApi from '../index';

// Define module-specific query keys with their implementations
export const ssoProviderKeys = {
  ...createQueryKeys('ssoProviders'),
};

/**
 * Hook to fetch all SSO providers
 */
export function useSSOproviders() {
  return useQuery({
    queryKey: ssoProviderKeys.list(),
    queryFn: async () => {
      const api = getApi();
      const response = await api.sso.ssoControllerGetProviders();
      return response.data;
    },
  });
}

/**
 * Hook to fetch a single SSO provider by ID
 */
export function useSSOprovider(
  id?: string | number | null,
  config?: QueryConfig<SSOProvider, ApiError>
) {
  return useQuery({
    queryKey: ssoProviderKeys.detail(id ?? '__UNDEFINED__'),
    queryFn: async () => {
      if (!id) {
        throw new Error('SSO Provider ID is required');
      }

      const api = getApi();
      const response = await api.sso.ssoControllerGetProviderById(String(id));
      return response.data;
    },
    enabled: !!id,
    ...config,
  });
}

/**
 * Hook to create a new SSO provider
 */
export function useCreateSSOprovider() {
  const queryClient = useQueryClient();

  return useMutation<SSOProvider, ApiError, CreateSSOProviderDto>({
    mutationFn: async (data) => {
      const api = getApi();
      const response = await api.sso.ssoControllerCreateProvider(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the list of providers to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: ssoProviderKeys.list(),
      });
    },
  });
}

/**
 * Hook to update an existing SSO provider
 */
export function useUpdateSSOprovider() {
  const queryClient = useQueryClient();

  return useMutation<
    SSOProvider,
    ApiError,
    { id: string | number; data: UpdateSSOProviderDto }
  >({
    mutationFn: async ({ id, data }) => {
      const api = getApi();
      const response = await api.sso.ssoControllerUpdateProvider(
        String(id),
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific provider
      queryClient.invalidateQueries({
        queryKey: ssoProviderKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: ssoProviderKeys.detail(variables.id),
      });
    },
  });
}

/**
 * Hook to delete an SSO provider
 */
export function useDeleteSSOprovider() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string | number>({
    mutationFn: async (id) => {
      const api = getApi();
      await api.sso.ssoControllerDeleteProvider(String(id));
    },
    onSuccess: () => {
      // Invalidate the list of providers to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: ssoProviderKeys.list(),
      });
    },
  });
}
