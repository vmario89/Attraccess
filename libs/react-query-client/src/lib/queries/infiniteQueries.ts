// generated with @7nohe/openapi-react-query-codegen@1.6.2 

import { InfiniteData, UseInfiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { ResourceIntroductionService, ResourceUsageService, ResourcesService, UsersService } from "../requests/services.gen";
import * as Common from "./common";
export const useUsersServiceGetAllUsersInfinite = <TData = InfiniteData<Common.UsersServiceGetAllUsersDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>({ limit, search }: {
  limit?: number;
  search?: string;
} = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseUsersServiceGetAllUsersKeyFn({ limit, search }, queryKey), queryFn: ({ pageParam }) => UsersService.getAllUsers({ limit, page: pageParam as number, search }) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: string;
  }).nextPage, ...options
});
export const useUsersServiceGetAllWithPermissionInfinite = <TData = InfiniteData<Common.UsersServiceGetAllWithPermissionDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>({ limit, permission }: {
  limit?: number;
  permission?: "canManageResources" | "canManageSystemConfiguration" | "canManageUsers";
} = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseUsersServiceGetAllWithPermissionKeyFn({ limit, permission }, queryKey), queryFn: ({ pageParam }) => UsersService.getAllWithPermission({ limit, page: pageParam as number, permission }) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: string;
  }).nextPage, ...options
});
export const useResourcesServiceGetAllResourcesInfinite = <TData = InfiniteData<Common.ResourcesServiceGetAllResourcesDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>({ limit, search }: {
  limit?: number;
  search?: string;
} = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseResourcesServiceGetAllResourcesKeyFn({ limit, search }, queryKey), queryFn: ({ pageParam }) => ResourcesService.getAllResources({ limit, page: pageParam as number, search }) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: string;
  }).nextPage, ...options
});
export const useResourceUsageServiceGetHistoryOfResourceUsageInfinite = <TData = InfiniteData<Common.ResourceUsageServiceGetHistoryOfResourceUsageDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>({ limit, resourceId, userId }: {
  limit?: number;
  resourceId: number;
  userId?: number;
}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseResourceUsageServiceGetHistoryOfResourceUsageKeyFn({ limit, resourceId, userId }, queryKey), queryFn: ({ pageParam }) => ResourceUsageService.getHistoryOfResourceUsage({ limit, page: pageParam as number, resourceId, userId }) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: string;
  }).nextPage, ...options
});
export const useResourceIntroductionServiceGetAllResourceIntroductionsInfinite = <TData = InfiniteData<Common.ResourceIntroductionServiceGetAllResourceIntroductionsDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>({ limit, resourceId }: {
  limit: number;
  resourceId: number;
}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseResourceIntroductionServiceGetAllResourceIntroductionsKeyFn({ limit, resourceId }, queryKey), queryFn: ({ pageParam }) => ResourceIntroductionService.getAllResourceIntroductions({ limit, page: pageParam as number, resourceId }) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: string;
  }).nextPage, ...options
});
