import { PluginManifest } from '@attraccess/react-query-client';
import { IPlugin } from 'react-pluggable';
import { create } from 'zustand';

export interface PluginManifestWithPlugin extends PluginManifest {
  plugin: IPlugin;
}

interface PluginState {
  plugins: PluginManifestWithPlugin[];
  addPlugin: (plugin: PluginManifestWithPlugin) => void;
}

const usePluginState = create<PluginState>((set) => ({
  plugins: [],
  addPlugin: (plugin) =>
    set((state) => {
      return { plugins: [...state.plugins, plugin] };
    }),
}));

export default usePluginState;
