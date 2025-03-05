import { UseQueryOptions } from '@tanstack/react-query';

/**
 * Generic query configuration type that can be used across all query hooks
 */
export type QueryConfig<TData, TError> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
>;

/**
 * Utility to create a query key factory for a module
 * @param module The module name (resource type)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createQueryKeys<T extends Record<string, any>>(module: string) {
  const baseKey = [module] as const;

  // Base query key structure that modules can extend
  return {
    all: baseKey,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    list: (params?: Record<string, any>) =>
      [...baseKey, 'list', params] as const,
    detail: (id: number | string) => [...baseKey, 'detail', id] as const,
    ...({} as T), // Allow extensions by module
  };
}

/**
 * Standard error interface for API responses
 */
export interface ApiError {
  message: string;
  statusCode: number;
}
