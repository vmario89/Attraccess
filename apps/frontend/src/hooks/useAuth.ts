import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CreateSessionResponse, OpenAPI, SystemPermissions, useAuthenticationServiceCreateSession, useAuthenticationServiceEndSession, User, useUsersServiceGetCurrent } from '@attraccess/react-query-client';

interface LoginCredentials {
  username: string;
  password: string;
  persist: boolean;
}

const AUTH_QUERY_KEY = ['auth', 'session'] as const;

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const curentUser = useUsersServiceGetCurrent();

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
        const response = await curentUser.refetch();

        auth.user = response.data as User;

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

  const createSession = useAuthenticationServiceCreateSession();

  const login = useMutation({
    mutationFn: async ({ username, password, persist }: LoginCredentials) => {
      const response = await createSession.mutateAsync({requestBody: {username, password}});

      // Store the auth data in the appropriate storage
      if (persist) {
        localStorage.setItem('auth', JSON.stringify(response));
      } else {
        sessionStorage.setItem('auth', JSON.stringify(response));
      }

      OpenAPI.TOKEN = response.authToken;

      return response;
    },
    onSuccess: (data) => {
      // Update the auth query data
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });

  const jwtTokenLogin = useMutation({
    mutationFn: async (auth: CreateSessionResponse) => {
      // TODO: determine this somehow
      const persist = true;

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

  const deleteSession = useAuthenticationServiceEndSession();

  const logout = useMutation({
    mutationFn: async () => {
      await deleteSession.mutateAsync();

      localStorage.removeItem('auth');
      sessionStorage.removeItem('auth');

      OpenAPI.TOKEN = '';
    },
    onSuccess: () => {
      // First set auth state to null to update UI immediately
      queryClient.setQueryData(AUTH_QUERY_KEY, null);

      // Clear all query caches to prevent data leakage between users
      queryClient.clear();

      // Force a refresh of the auth state
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });

      // Navigate to the root which will show the unauthorized component
      navigate('/', { replace: true });
    },
  });

  return {
    session,
    user: session?.user ?? null,
    isLoading,
    error,
    isAuthenticated: !!session?.user,
    login,
    jwtTokenLogin,
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
