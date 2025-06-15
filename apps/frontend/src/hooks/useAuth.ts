import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CreateSessionResponse,
  OpenAPI,
  SystemPermissions,
  useAuthenticationServiceCreateSession,
  useAuthenticationServiceEndSession,
  useAuthenticationServiceRefreshSession,
  useUsersServiceGetCurrent,
  useUsersServiceGetCurrentKey,
} from '@attraccess/react-query-client';
import { useCallback, useEffect, useState } from 'react';

interface LoginCredentials {
  username: string;
  password: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isInitialized, setIsInitialized] = useState(false);

  const { data: currentUser, error: currentUserError } = useUsersServiceGetCurrent(undefined, {
    refetchInterval: 1000 * 60 * 20, // 20 minutes
  });

  useEffect(() => {
    if (currentUser || currentUserError) {
      console.log('setting isInitialized to true', currentUser);
      setIsInitialized(true);
    }
  }, [currentUser, currentUserError]);

  const { mutate: jwtTokenLoginMutate } = useMutation({
    mutationFn: async (data: { auth: CreateSessionResponse | null }) => {
      const { auth } = data;
      // Store the auth data in the appropriate storage
      if (!auth) {
        localStorage.removeItem('auth');
        sessionStorage.removeItem('auth');
        OpenAPI.TOKEN = '';
        return null;
      }

      localStorage.setItem('auth', JSON.stringify(auth));

      OpenAPI.TOKEN = auth.authToken;
      return auth;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [useUsersServiceGetCurrentKey] });
    },
  });

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

      jwtTokenLoginMutate({ auth });
    } catch (e) {
      console.error('Error parsing persisted auth:', e);
    }
  }, [jwtTokenLoginMutate]);

  useEffect(() => {
    loadExistingAuth();
  }, [loadExistingAuth]);

  const { mutate: createSessionMutate, data: session } = useAuthenticationServiceCreateSession({
    onSuccess: (data) => {
      jwtTokenLoginMutate({ auth: data });
    },
  });

  const login = useMutation({
    mutationFn: async ({ username, password }: LoginCredentials) => {
      createSessionMutate({ requestBody: { username, password } });
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

  const { data: refreshedSession } = useAuthenticationServiceRefreshSession(undefined, {
    refetchInterval: 1000 * 60 * 20, // 20 minutes,
    enabled: !!currentUser && isInitialized,
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (refreshedSession) {
      jwtTokenLoginMutate({ auth: refreshedSession });
    }
  }, [refreshedSession, jwtTokenLoginMutate]);

  return {
    session,
    user: currentUser ?? null,
    isAuthenticated: !!currentUser,
    isInitialized,
    login,
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
