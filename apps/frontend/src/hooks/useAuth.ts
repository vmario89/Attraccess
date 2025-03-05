import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateSessionResponse, CreateUserDto } from '@attraccess/api-client';
import getApi from '../api';

interface SystemPermissions {
  canManageResources: boolean;
  canManageUsers: boolean;
}

interface LoginCredentials {
  username: string;
  password: string;
  persist: boolean;
}

const AUTH_QUERY_KEY = ['auth', 'session'] as const;

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: session,
    isLoading,
    error,
  } = useQuery<CreateSessionResponse | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      let auth: CreateSessionResponse | null = null;
      let persistedInLocalStorage = false;

      try {
        const authInLocalStorage = localStorage.getItem('auth');
        const authInSessionStorage = sessionStorage.getItem('auth');
        const authInPersistence = authInLocalStorage || authInSessionStorage;

        persistedInLocalStorage = authInLocalStorage !== null;

        if (!authInPersistence) {
          return null;
        }

        auth = JSON.parse(authInPersistence) as CreateSessionResponse;
      } catch (e) {
        console.error('Error parsing persisted auth:', e);
        return null;
      }

      try {
        // Verify the session with the API
        const api = getApi();
        const me = await api.users.usersControllerGetMe();

        auth.user = me.data;

        if (persistedInLocalStorage) {
          localStorage.setItem('auth', JSON.stringify(auth));
        } else {
          sessionStorage.setItem('auth', JSON.stringify(auth));
        }
      } catch (err) {
        console.error('Error verifying auth:', err);
        // If we get an error (401, 403, etc), clear the auth state
        localStorage.removeItem('auth');
        sessionStorage.removeItem('auth');
        return null;
      }

      return auth;
    },
    retry: false,
    staleTime: 1000 * 60 * 20, // 20 minutes
    refetchInterval: 1000 * 60 * 20, // 20 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const login = useMutation({
    mutationFn: async ({ username, password, persist }: LoginCredentials) => {
      const api = getApi();
      const response = await api.authentication.authControllerPostSession({
        username,
        password,
      });
      const auth = response.data;

      // Store the auth data in the appropriate storage
      if (persist) {
        localStorage.setItem('auth', JSON.stringify(auth));
      } else {
        sessionStorage.setItem('auth', JSON.stringify(auth));
      }

      return auth;
    },
    onSuccess: (data) => {
      // Update the auth query data
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });

  const signup = useMutation({
    mutationFn: async ({
      username,
      password,
      email,
      strategy,
    }: CreateUserDto) => {
      const api = getApi();
      const response = await api.users.usersControllerCreateUser({
        username,
        password,
        email,
        strategy,
      });
      return response.data;
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      const api = getApi();
      await api.authentication.authControllerDeleteSession();
      localStorage.removeItem('auth');
      sessionStorage.removeItem('auth');
    },
    onSuccess: () => {
      // Clear the auth query data
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
    },
  });

  return {
    session,
    user: session?.user ?? null,
    isLoading,
    error,
    isAuthenticated: !!session?.user,
    login,
    signup,
    logout,
    hasPermission: (permission: keyof SystemPermissions) => {
      const user = session?.user;
      if (
        !user?.systemPermissions ||
        typeof user.systemPermissions !== 'object'
      ) {
        return false;
      }
      return (user.systemPermissions as SystemPermissions)[permission] ?? false;
    },
  };
}
