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
} from '@attraccess/react-query-client';
import { useCallback, useEffect, useRef, useState } from 'react';

interface LoginCredentials {
  username: string;
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

      console.log('jwt from persisted auth', auth);
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
    console.log('loading existing auth');
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

    console.log('jwt from refreshed session', refreshedSession);
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
      return login.mutate({ requestBody: { username: data.username, password: data.password } });
    },
    mutateAsync: async (data: { username: string; password: string }) => {
      return login.mutateAsync({ requestBody: { username: data.username, password: data.password } });
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

      console.log('[jwtTokenLoginMutate] setting auth', auth);
      localStorage.setItem('auth', JSON.stringify(auth));

      console.log('[jwtTokenLoginMutate] setting token for api', auth.authToken);
      OpenAPI.TOKEN = auth.authToken;

      setIsInitialized(true);

      return auth;
    },
    onSuccess: () => {
      setTimeout(() => {
        console.log('[jwtTokenLoginMutate] invalidating queries');
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
