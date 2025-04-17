// generated with @7nohe/openapi-react-query-codegen@1.6.2 

import { InfiniteData, UseInfiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { ResourceGroupsService, ResourceIntroductionsService, ResourceUsageService, ResourcesService, UsersService } from "../requests/services.gen";
import * as Common from "./common";
export const useUsersServiceGetAllUsersInfinite = <TData = InfiniteData<Common.UsersServiceGetAllUsersDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>({ limit, search }: {
  limit?: number;
  search?: string;
} = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseUsersServiceGetAllUsersKeyFn({ limit, search }, queryKey), queryFn: ({ pageParam }) => UsersService.getAllUsers({ limit, page: pageParam as number, search }) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useUsersServiceGetAllWithPermissionInfinite = <TData = InfiniteData<Common.UsersServiceGetAllWithPermissionDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>({ limit, permission }: {
  limit?: number;
  permission?: "canManageResources" | "canManageSystemConfiguration" | "canManageUsers";
} = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseUsersServiceGetAllWithPermissionKeyFn({ limit, permission }, queryKey), queryFn: ({ pageParam }) => UsersService.getAllWithPermission({ limit, page: pageParam as number, permission }) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useResourceGroupsServiceGetAllResourceGroupsInfinite = <TData = InfiniteData<Common.ResourceGroupsServiceGetAllResourceGroupsDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>({ limit, search }: {
  limit?: number;
  search?: string;
} = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseResourceGroupsServiceGetAllResourceGroupsKeyFn({ limit, search }, queryKey), queryFn: ({ pageParam }) => ResourceGroupsService.getAllResourceGroups({ limit, page: pageParam as number, search }) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useResourcesServiceGetAllResourcesInfinite = <TData = InfiniteData<Common.ResourcesServiceGetAllResourcesDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>({ groupId, limit, search }: {
  groupId?: number;
  limit?: number;
  search?: string;
} = {}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseResourcesServiceGetAllResourcesKeyFn({ groupId, limit, search }, queryKey), queryFn: ({ pageParam }) => ResourcesService.getAllResources({ groupId, limit, page: pageParam as number, search }) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useResourceUsageServiceGetHistoryOfResourceUsageInfinite = <TData = InfiniteData<Common.ResourceUsageServiceGetHistoryOfResourceUsageDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>({ limit, resourceId, userId }: {
  limit?: number;
  resourceId: number;
  userId?: number;
}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseResourceUsageServiceGetHistoryOfResourceUsageKeyFn({ limit, resourceId, userId }, queryKey), queryFn: ({ pageParam }) => ResourceUsageService.getHistoryOfResourceUsage({ limit, page: pageParam as number, resourceId, userId }) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
export const useResourceIntroductionsServiceGetAllResourceIntroductionsInfinite = <TData = InfiniteData<Common.ResourceIntroductionsServiceGetAllResourceIntroductionsDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>({ limit, resourceId }: {
  limit: number;
  resourceId: number;
}, queryKey?: TQueryKey, options?: Omit<UseInfiniteQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useInfiniteQuery({
  queryKey: Common.UseResourceIntroductionsServiceGetAllResourceIntroductionsKeyFn({ limit, resourceId }, queryKey), queryFn: ({ pageParam }) => ResourceIntroductionsService.getAllResourceIntroductions({ limit, page: pageParam as number, resourceId }) as TData, initialPageParam: "1", getNextPageParam: response => (response as {
    nextPage: number;
  }).nextPage, ...options
});
