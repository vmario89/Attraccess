import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CreateSessionResponse,
  OpenAPI,
  SystemPermissions,
  useAuthenticationServiceCreateSession,
  useAuthenticationServiceEndSession,
  useAuthenticationServiceRefreshSession,
  useAuthenticationServiceRefreshSessionKey,
  useUsersServiceGetCurrent,
} from '@fabaccess/react-query-client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export function usePersistedAuth() {
  const { jwtTokenLoginMutate } = useAuth();

  const loadExistingAuth = useCallback(async () => {
    let auth: CreateSessionResponse | null = null;

    try {
      const authFromLocalStorage = localStorage.getItem('auth');
      const authFromSessionStorage = sessionStorage.getItem('auth');

      const authFromAnySource = authFromLocalStorage ?? authFromSessionStorage;

      if (!authFromAnySource) {
        console.warn('No auth found in any source', {
          authFromLocalStorage,
          authFromSessionStorage,
        });
        return;
      }

      if (typeof authFromAnySource === 'string') {
        auth = JSON.parse(authFromAnySource) as CreateSessionResponse;
      } else {
        auth = authFromAnySource;
      }

      jwtTokenLoginMutate(auth);
    } catch (e) {
      console.error('Error parsing persisted auth:', e);
    }
  }, [jwtTokenLoginMutate]);

  const didLoadExistingAuth = useRef(false);

  useEffect(() => {
    if (didLoadExistingAuth.current) {
      return;
    }

    didLoadExistingAuth.current = true;
    loadExistingAuth();
  }, [loadExistingAuth]);
}

export function useRefreshSession() {
  const { isInitialized, jwtTokenLoginMutate } = useAuth();
  const { data: refreshedSession } = useAuthenticationServiceRefreshSession(undefined, {
    refetchInterval: 1000 * 60 * 20, // 20 minutes,
    enabled: isInitialized,
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });

  const lastRefreshedSessionToken = useRef<string | null>(null);

  useEffect(() => {
    if (!refreshedSession) {
      return;
    }

    if (lastRefreshedSessionToken.current === refreshedSession.authToken) {
      return;
    }
    lastRefreshedSessionToken.current = refreshedSession.authToken;

    jwtTokenLoginMutate(refreshedSession);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshedSession]);
}

export function useLogin() {
  const { jwtTokenLoginMutate } = useAuth();

  const login = useAuthenticationServiceCreateSession({
    onSuccess: (data) => {
      jwtTokenLoginMutate(data);
    },
  });

  return {
    ...login,
    mutate: async (data: LoginCredentials) => {
      return login.mutate({ requestBody: { username: data.usernameOrEmail, password: data.password } });
    },
    mutateAsync: async (data: { usernameOrEmail: string; password: string }) => {
      return login.mutateAsync({ requestBody: { username: data.usernameOrEmail, password: data.password } });
    },
  };
}

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isInitialized, setIsInitialized] = useState(false);

  const { data: currentUser, error: currentUserError } = useUsersServiceGetCurrent(undefined, {
    refetchInterval: 1000 * 60 * 20, // 20 minutes
    retry: false,
  });

  useEffect(() => {
    if (currentUser || currentUserError) {
      setIsInitialized(true);
    }
  }, [currentUser, currentUserError]);

  const { mutate: jwtTokenLoginMutate } = useMutation({
    mutationFn: async (auth: CreateSessionResponse) => {
      // Store the auth data in the appropriate storage
      if (!auth) {
        console.error('[jwtTokenLoginMutate] auth is null');
        throw new Error('Auth is null');
      }

      localStorage.setItem('auth', JSON.stringify(auth));

      OpenAPI.TOKEN = auth.authToken;

      setIsInitialized(true);

      return auth;
    },
    onSuccess: () => {
      setTimeout(() => {
        // Invalidate all queries except the refresh session query to prevent infinite loop
        queryClient.invalidateQueries({
          predicate: (query) => {
            // Don't invalidate the refresh session query
            return !query.queryKey.includes(useAuthenticationServiceRefreshSessionKey);
          },
        });
      }, 1000);
    },
  });

  const { mutate: deleteSession } = useAuthenticationServiceEndSession({
    onSuccess: async () => {
      localStorage.removeItem('auth');
      sessionStorage.removeItem('auth');

      OpenAPI.TOKEN = '';

      navigate('/', { replace: true });
      window.location.reload();
    },
  });

  const logout = useCallback(() => {
    deleteSession();
  }, [deleteSession]);

  return {
    user: currentUser ?? null,
    isAuthenticated: !!currentUser,
    isInitialized,
    jwtTokenLoginMutate,
    logout,
    hasPermission: (permission: keyof SystemPermissions) => {
      if (!currentUser?.systemPermissions || typeof currentUser.systemPermissions !== 'object') {
        return false;
      }
      return (currentUser.systemPermissions as SystemPermissions)[permission] ?? false;
    },
  };
}
