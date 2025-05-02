import { PluginManifest, usePluginServiceGetPlugins } from '@attraccess/react-query-client';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { getBaseUrl } from '@frontend/api';
import { PropsWithChildren, useCallback, useEffect } from 'react';
import { createPluginStore, IPlugin, PluginProvider as PluginProviderBase, RendererPlugin } from 'react-pluggable';
import usePluginState from './plugin.state';

export class PluginLoadedEvent extends Event {
  constructor(public readonly pluginManifest: PluginManifest) {
    super('pluginLoaded');
  }
}

const pluginStore = createPluginStore();
export function PluginProvider(props: PropsWithChildren) {
  const { data: plugins } = usePluginServiceGetPlugins();
  const { addPlugin } = usePluginState();

  useEffect(() => {
    const rendererPlugin = new RendererPlugin();
    pluginStore.install(rendererPlugin);

    return () => {
      pluginStore.uninstall(rendererPlugin.getPluginName());
    };
  }, [plugins]);

  const loadPlugin = useCallback(
    async (pluginManifest: PluginManifest) => {
      const pluginModule = await import(getBaseUrl() + `/api/plugins/${pluginManifest.name}/frontend/plugin.js`);
      const pluginClass = pluginModule.default;
      const plugin = new pluginClass() as IPlugin;
      pluginStore.install(plugin);

      await new Promise((resolve) => setTimeout(resolve, 200));
      addPlugin({
        ...pluginManifest,
        plugin,
      });
    },
    [addPlugin]
  );

  useEffect(() => {
    (plugins ?? []).forEach(loadPlugin);
  }, [plugins, loadPlugin]);
  return <PluginProviderBase pluginStore={pluginStore}>{props.children}</PluginProviderBase>;
}
