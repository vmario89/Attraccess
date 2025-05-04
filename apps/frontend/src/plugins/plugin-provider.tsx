import { OpenAPI, PluginManifest, usePluginServiceGetPlugins } from '@attraccess/react-query-client';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { getBaseUrl } from '@frontend/api';
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { createPluginStore, PluginProvider as PluginProviderBase, RendererPlugin } from 'react-pluggable';
import usePluginState from './plugin.state';
import {
  __federation_method_getRemote as getRemote,
  __federation_method_setRemote as setRemote,
  __federation_method_unwrapDefault as unwrapModule,
  // eslint-disable-next-line
  // @ts-ignore
} from 'virtual:__federation__';
import { AttraccessFrontendPlugin, AttraccessFrontendPluginAuthData } from '@attraccess/plugins-frontend-sdk';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { useAuth } from '@frontend/hooks/useAuth';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { ToastType, useToastMessage } from '@frontend/components/toastProvider';

// eslint-disable-next-line
// @ts-ignore
declare module 'virtual:__federation__' {
  interface IRemoteConfig {
    url: (() => Promise<string>) | string;
    format: 'esm' | 'systemjs' | 'var';
    from: 'vite' | 'webpack';
  }

  export function __federation_method_setRemote(name: string, config: IRemoteConfig): void;

  export function __federation_method_getRemote(name: string, exposedPath: string): Promise<unknown>;

  export function __federation_method_unwrapDefault(unwrappedModule: unknown): Promise<unknown>;

  export function __federation_method_ensure(remoteName: string): Promise<unknown>;

  export function __federation_method_wrapDefault(module: unknown, need: boolean): Promise<unknown>;
}

export class PluginLoadedEvent extends Event {
  constructor(public readonly pluginManifest: PluginManifest) {
    super('pluginLoaded');
  }
}

const pluginStore = createPluginStore();
export function PluginProvider(props: PropsWithChildren) {
  const { refetch: refetchPlugins } = usePluginServiceGetPlugins();
  const { addPlugin, isInstalled, plugins } = usePluginState();
  const toast = useToastMessage();
  const { user } = useAuth();

  // Add refs to track initialization state
  const isPluginSystemInitialized = useRef(false);
  const arePluginsLoaded = useRef(false);

  useEffect(() => {
    if (isPluginSystemInitialized.current) return;
    isPluginSystemInitialized.current = true;

    console.log('Attraccess Plugin System: initializing');

    console.log('Attraccess Plugin System: installing renderer plugin');
    const rendererPlugin = new RendererPlugin();
    pluginStore.install(rendererPlugin);

    console.log('Attraccess Plugin System: adding notificationToast function');
    pluginStore.addFunction(
      'notificationToast',
      (params: { title: string; description: string; type: ToastType; duration?: number }) => {
        toast.showToast({
          title: params.title,
          description: params.description,
          type: params.type,
          duration: params.duration,
        });
      }
    );

    return () => {
      console.log('Attraccess Plugin System: uninstalling renderer plugin');
      pluginStore.uninstall(rendererPlugin.getPluginName());

      console.log('Attraccess Plugin System: removing notificationToast function');
      pluginStore.removeFunction('notificationToast');

      // Reset the initialization state on unmount
      isPluginSystemInitialized.current = false;
    };
  }, [toast]);

  const loadPlugin = useCallback(
    async (pluginManifest: PluginManifest) => {
      try {
        console.log(`Attraccess Plugin System: loading plugin ${pluginManifest.name}`);
        const entryPointFile = pluginManifest.main.frontend?.entryPoint;

        if (!entryPointFile) {
          console.log(
            `Attraccess Plugin System: Plugin ${pluginManifest.name} has no entry point file for frontend, skipping`
          );
          return;
        }

        const baseUrl = getBaseUrl();
        const remoteUrl = `${baseUrl}/api/plugins/${pluginManifest.name}/frontend/module-federation/${entryPointFile}`;

        setRemote(pluginManifest.name, {
          url: remoteUrl,
          externalType: 'url',
          format: 'esm',
        });

        const pluginClassModule = await getRemote(pluginManifest.name, './plugin');
        const pluginClass = await unwrapModule(pluginClassModule);

        // Initialize the plugin
        const plugin = new pluginClass() as AttraccessFrontendPlugin;

        const pluginName = plugin.getPluginName();
        console.log(`Attraccess Plugin System: Checking if plugin ${pluginName} is installed`);
        if (isInstalled(pluginName)) {
          console.log(`Attraccess Plugin System: Plugin ${pluginName} is already installed, uninstalling first`);
          pluginStore.uninstall(pluginName);
        }

        pluginStore.install(plugin);

        await new Promise((resolve) => setTimeout(resolve, 200));
        const fullPlugin = {
          ...pluginManifest,
          plugin,
        };
        addPlugin(fullPlugin);

        console.log(`Attraccess Plugin System: Plugin ${pluginName} loaded`);
        return fullPlugin;
      } catch (error) {
        console.error(`Attraccess Plugin System: Failed to load plugin: ${pluginManifest.name}`, error);
      }
    },
    [addPlugin, isInstalled]
  );

  useEffect(() => {
    console.log('updating plugins on auth state change', plugins, user);
    plugins.forEach((plugin) => {
      plugin.plugin.onApiEndpointChange(getBaseUrl());
      plugin.plugin.onApiAuthStateChange({
        authToken: OpenAPI.TOKEN as string,
        user: user as unknown as AttraccessFrontendPluginAuthData['user'],
      });
    });
  }, [plugins, user]);

  const loadAllPlugins = useCallback(async () => {
    if (arePluginsLoaded.current) return;
    console.log('Attraccess Plugin System: Loading all plugins');

    const plugins = await refetchPlugins();
    const pluginsArray = plugins.data ?? [];
    await Promise.all(pluginsArray.map(loadPlugin));

    arePluginsLoaded.current = true;
    console.log('Attraccess Plugin System: All plugins loaded');
  }, [loadPlugin, refetchPlugins]);

  useEffect(() => {
    if (arePluginsLoaded.current) return;
    console.log('Attraccess Plugin System: Refetching plugins');
    loadAllPlugins();

    // We're using the ref as our control mechanism, so the dependency array can be empty
    // to ensure this only runs once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <PluginProviderBase pluginStore={pluginStore}>{props.children}</PluginProviderBase>;
}
