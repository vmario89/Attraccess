import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateResourceDto,
  Resource,
  UpdateResourceDto,
  ResourcesControllerGetResourcesParams,
  ResourcesControllerGetResourcesData,
} from '@attraccess/api-client';
import { baseQueryKeys } from './base';
import getApi from '../index';

interface ResourceError {
  message: string;
  statusCode: number;
}

export function useResources(params?: ResourcesControllerGetResourcesParams) {
  return useQuery({
    queryKey: baseQueryKeys.resources.list(params),
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
    queryKey: baseQueryKeys.resources.detail(id),
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

  return useMutation<Resource, ResourceError, CreateResourceDto>({
    mutationFn: async (data) => {
      const api = getApi();
      const response = await api.resources.resourcesControllerCreateResource(
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: baseQueryKeys.resources.all,
      });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation<
    Resource,
    ResourceError,
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
        queryKey: baseQueryKeys.resources.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: baseQueryKeys.resources.all,
      });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation<void, ResourceError, number>({
    mutationFn: async (id) => {
      const api = getApi();
      await api.resources.resourcesControllerDeleteResource(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: baseQueryKeys.resources.all,
      });
    },
  });
}
