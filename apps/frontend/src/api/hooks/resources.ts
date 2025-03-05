import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateResourceDto,
  Resource,
  UpdateResourceDto,
  ResourcesControllerGetResourcesParams,
  ResourcesControllerGetResourcesData,
} from '@attraccess/api-client';
import { ApiError, createQueryKeys } from './base';
import getApi from '../index';

// Define module-specific query keys
export const resourcesKeys = {
  ...createQueryKeys('resources'),
  // Custom keys could be added here if needed
};

export function useResources(params?: ResourcesControllerGetResourcesParams) {
  return useQuery({
    queryKey: resourcesKeys.list(params),
    queryFn: async () => {
      const api = getApi();
      const response = await api.resources.resourcesControllerGetResources({
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search,
      });
      return response.data as ResourcesControllerGetResourcesData;
    },
  });
}

export function useResource(id: number) {
  return useQuery({
    queryKey: resourcesKeys.detail(id),
    queryFn: async () => {
      const api = getApi();
      const response = await api.resources.resourcesControllerGetResourceById(
        id
      );
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation<Resource, ApiError, CreateResourceDto>({
    mutationFn: async (data) => {
      const api = getApi();
      const response = await api.resources.resourcesControllerCreateResource(
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: resourcesKeys.all,
      });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation<
    Resource,
    ApiError,
    { id: number; data: UpdateResourceDto }
  >({
    mutationFn: async ({ id, data }) => {
      const api = getApi();
      const response = await api.resources.resourcesControllerUpdateResource(
        id,
        data
      );
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: resourcesKeys.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: resourcesKeys.all,
      });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, number>({
    mutationFn: async (id) => {
      const api = getApi();
      await api.resources.resourcesControllerDeleteResource(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: resourcesKeys.all,
      });
    },
  });
}
