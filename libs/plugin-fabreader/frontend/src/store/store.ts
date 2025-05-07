import { AttraccessFrontendPluginAuthData } from '@attraccess/plugins-frontend-sdk';
import { OpenAPI } from '@attraccess/react-query-client';
import { PluginStore } from 'react-pluggable';
import { create } from 'zustand';

interface PluginState {
  auth: AttraccessFrontendPluginAuthData | null;
  setAuthData: (data: AttraccessFrontendPluginAuthData | null) => void;
  endpoint: string | null;
  setEndpoint: (endpoint: string | null) => void;
  pluginStore: PluginStore;
  setPluginStore: (pluginStore: PluginStore) => void;
}

export const useStore = create<PluginState>((set) => ({
  auth: null,
  setAuthData: (data) => {
    set({ auth: data });
    OpenAPI.TOKEN = data?.authToken ?? '';
  },
  endpoint: null,
  setEndpoint: (endpoint) => {
    set({ endpoint });
    OpenAPI.BASE = endpoint ?? '';
  },
  pluginStore: null as unknown as PluginStore,
  setPluginStore: (pluginStore) => set({ pluginStore }),
}));
