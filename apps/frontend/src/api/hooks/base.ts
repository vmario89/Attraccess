import { ResourcesControllerGetResourcesParams } from '@attraccess/api-client';
import { UseQueryOptions } from '@tanstack/react-query';

export type QueryConfig<TData, TError> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
>;

export const queryKeys = {
  resources: {
    all: ['resources'] as const,
    list: (params?: ResourcesControllerGetResourcesParams) =>
      [...queryKeys.resources.all, 'list', params] as const,
    detail: (id: number) => [...queryKeys.resources.all, 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    verifyEmail: (email: string, token: string) =>
      [...queryKeys.users.all, 'verifyEmail', email, token] as const,
  },
  resourceUsage: {
    all: ['resourceUsage'] as const,
    active: (resourceId: number) =>
      [...queryKeys.resourceUsage.all, 'active', resourceId] as const,
    history: (resourceId: number) =>
      [...queryKeys.resourceUsage.all, 'history', resourceId] as const,
  },
  resourceIntroduction: {
    all: ['resourceIntroduction'] as const,
    status: (resourceId: number) =>
      [...queryKeys.resourceIntroduction.all, 'status', resourceId] as const,
    introducers: (resourceId: number) =>
      [
        ...queryKeys.resourceIntroduction.all,
        'introducers',
        resourceId,
      ] as const,
    list: (resourceId: number, params?: { page?: number; limit?: number }) =>
      [
        ...queryKeys.resourceIntroduction.all,
        'list',
        resourceId,
        params,
      ] as const,
  },
} as const;
