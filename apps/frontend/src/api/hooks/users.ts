import { useMutation, useQuery } from '@tanstack/react-query';
import { VerifyEmailDto } from '@attraccess/api-client';
import getApi from '../index';

interface VerifyEmailError {
  message: string;
  statusCode: number;
}

// Query keys for caching
export const usersQueryKeys = {
  users: {
    all: ['users', 'all'] as const,
    detail: (userId: number) => ['users', 'detail', userId] as const,
    search: (searchTerm: string) => ['users', 'search', searchTerm] as const,
  },
};

export function useVerifyEmail() {
  return useMutation<void, VerifyEmailError, VerifyEmailDto>({
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
    queryKey: [...usersQueryKeys.users.all, { page, limit }],
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
    queryKey: [...usersQueryKeys.users.search(searchTerm), { page, limit }],
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
export function useUserDetails(userId: number) {
  return useQuery({
    queryKey: usersQueryKeys.users.detail(userId),
    queryFn: async () => {
      const api = getApi();
      const response = await api.users.usersControllerGetUserById(userId);
      return response.data;
    },
    enabled: !!userId,
  });
}
