import { PluginStore } from 'react-pluggable';
import { FabreaderList } from './components/FabreaderList/FabreaderList';
import { NfcIcon } from 'lucide-react';
import {
  AttraccessFrontendPlugin,
  AttraccessFrontendPluginAuthData,
  RouteConfig,
} from '@attraccess/plugins-frontend-sdk';
import { useStore as store } from './store/store';
import { Providers } from './components/providers';

export default class FabreaderPlugin implements AttraccessFrontendPlugin {
  public pluginStore!: PluginStore;
  public readonly name = 'FABreader';
  public readonly version = 'v0.0.1';

  getPluginName(): string {
    return `${this.name}@${this.version}`;
  }

  getDependencies(): string[] {
    return [];
  }

  init(pluginStore: PluginStore): void {
    store.getState().setPluginStore(pluginStore);
    this.pluginStore = pluginStore;
  }

  onApiEndpointChange(endpoint: string): void {
    store.getState().setEndpoint(endpoint);
  }

  onApiAuthStateChange(authData: null | AttraccessFrontendPluginAuthData): void {
    store.getState().setAuthData(authData);
  }

  activate(): void {
    store.getState().pluginStore.addFunction(`${this.getPluginName()}.GET_ROUTES`, () => {
      return [
        {
          path: '/fabreader',
          element: (
            <Providers>
              <FabreaderList />
            </Providers>
          ),
          authRequired: true,
          sidebar: {
            label: 'FABReader',
            icon: <NfcIcon />,
          },
        },
      ] as RouteConfig[];
    });
  }

  deactivate(): void {
    store.getState().pluginStore.removeFunction(`${this.name}.GET_ROUTES`);
  }
}
