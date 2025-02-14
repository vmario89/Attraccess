import { CreateSessionResponse } from '@attraccess/api-client';
import { create } from 'zustand';
import api from '../api';

interface AppState {
  auth: CreateSessionResponse | null;
  loginIsInProgress: boolean;

  login: (
    username: string,
    password: string,
    options: { persist: boolean }
  ) => Promise<CreateSessionResponse>;
}

const authInLocalStorage =
  localStorage.getItem('auth') || sessionStorage.getItem('auth');
const persistedAuth: CreateSessionResponse | null = authInLocalStorage
  ? JSON.parse(authInLocalStorage)
  : null;

export const useAppState = create<AppState>((set) => ({
  auth: persistedAuth,
  loginIsInProgress: false,
  login: async (
    username: string,
    password: string,
    options: { persist: boolean }
  ) => {
    try {
      set({ loginIsInProgress: true });
      const auth = (await api.auth.authControllerPostSession({
        username,
        password,
      })) as unknown as CreateSessionResponse;
      set({ auth });

      if (options.persist) {
        localStorage.setItem('auth', JSON.stringify(auth));
      } else {
        sessionStorage.setItem('auth', JSON.stringify(auth));
      }

      return auth;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      set({ loginIsInProgress: false });
    }
  },
}));
