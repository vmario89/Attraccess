import { ResourcesControllerGetResourcesParams } from '@attraccess/api-client';
import { UseQueryOptions } from '@tanstack/react-query';

export type QueryConfig<TData, TError> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
>;

export const baseQueryKeys = {
  resources: {
    all: ['resources'] as const,
    list: (params?: ResourcesControllerGetResourcesParams) =>
      [...baseQueryKeys.resources.all, 'list', params] as const,
    detail: (id: number) =>
      [...baseQueryKeys.resources.all, 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    verifyEmail: (email: string, token: string) =>
      [...baseQueryKeys.users.all, 'verifyEmail', email, token] as const,
  },
  resourceUsage: {
    all: ['resourceUsage'] as const,
    active: (resourceId: number) =>
      [...baseQueryKeys.resourceUsage.all, 'active', resourceId] as const,
    history: (resourceId: number) =>
      [...baseQueryKeys.resourceUsage.all, 'history', resourceId] as const,
  },
  resourceIntroduction: {
    all: ['resourceIntroduction'] as const,
    status: (resourceId: number) =>
      [
        ...baseQueryKeys.resourceIntroduction.all,
        'status',
        resourceId,
      ] as const,
    introducers: (resourceId: number) =>
      [
        ...baseQueryKeys.resourceIntroduction.all,
        'introducers',
        resourceId,
      ] as const,
    list: (resourceId: number, params?: { page?: number; limit?: number }) =>
      [
        ...baseQueryKeys.resourceIntroduction.all,
        'list',
        resourceId,
        params,
      ] as const,
    history: (resourceId: number, introductionId: number) =>
      [
        ...baseQueryKeys.resourceIntroduction.all,
        'history',
        resourceId,
        introductionId,
      ] as const,
    revokedStatus: (resourceId: number, introductionId: number) =>
      [
        ...baseQueryKeys.resourceIntroduction.all,
        'revokedStatus',
        resourceId,
        introductionId,
      ] as const,
    detail: (resourceId: number, introductionId: number) =>
      [
        ...baseQueryKeys.resourceIntroduction.all,
        'detail',
        resourceId,
        introductionId,
      ] as const,
    canManageIntroductions: (resourceId: number) =>
      [
        ...baseQueryKeys.resourceIntroduction.all,
        'canManageIntroductions',
        resourceId,
      ] as const,
    canManageIntroducers: (resourceId: number) =>
      [
        ...baseQueryKeys.resourceIntroduction.all,
        'canManageIntroducers',
        resourceId,
      ] as const,
  },
} as const;
