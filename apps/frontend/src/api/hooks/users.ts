import { useMutation, useQuery } from '@tanstack/react-query';
import { VerifyEmailDto } from '@attraccess/api-client';
import { ApiError, createQueryKeys } from './base';
import getApi from '../index';

// Define module-specific query keys with combined implementation
export const usersKeys = {
  ...createQueryKeys('users'),
  // Custom query keys with their implementations
  verifyEmail: (email: string, token: string) =>
    ['users', 'verifyEmail', email, token] as const,
  search: (searchTerm: string) => ['users', 'search', searchTerm] as const,
};

export function useVerifyEmail() {
  return useMutation<void, ApiError, VerifyEmailDto>({
    mutationFn: async ({ email, token }) => {
      const api = getApi();
      await api.users.usersControllerVerifyEmail({
        email,
        token,
      });
    },
  });
}

// Get all users with pagination
export function useUsers(page = 1, limit = 10) {
  return useQuery({
    queryKey: usersKeys.list({ page, limit }),
    queryFn: async () => {
      const api = getApi();
      const response = await api.users.usersControllerGetUsers({
        page,
        limit,
      });
      return response.data;
    },
  });
}

// Search users with pagination
export function useSearchUsers(searchTerm = '', page = 1, limit = 10) {
  return useQuery({
    queryKey: [...usersKeys.search(searchTerm), { page, limit }],
    queryFn: async () => {
      const api = getApi();
      const response = await api.users.usersControllerGetUsers({
        page,
        limit,
        search: searchTerm,
      });
      return response.data;
    },
    enabled: page > 0 && limit > 0,
  });
}

// Get user details by ID
export function useUserDetails(userId?: number | null) {
  return useQuery({
    queryKey: usersKeys.detail(userId ?? '__UNDEFINED__'),
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const api = getApi();
      const response = await api.users.usersControllerGetUserById(userId);
      return response.data;
    },
    enabled: !!userId,
  });
}
