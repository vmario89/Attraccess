import { PluginStore } from 'react-pluggable';
import { FabreaderList } from './components/FabreaderList';
import { NfcIcon } from 'lucide-react';
import { AttraccessFrontendPlugin, AttraccessFrontendPluginAuthData } from '@attraccess/plugins';
import { useAuthStore } from './store/auth.store';

export class FabreaderPlugin implements AttraccessFrontendPlugin {
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
    this.pluginStore = pluginStore;
  }

  onApiAuthStateChange(authData: null | AttraccessFrontendPluginAuthData): void {
    useAuthStore.getState().setAuthToken(authData?.authToken || null);
  }

  activate(): void {
    this.pluginStore.addFunction(`${this.getPluginName()}.GET_ROUTES`, () => {
      return [
        {
          path: '/fabreader',
          element: <FabreaderList />,
          sidebar: {
            label: 'FABReader',
            icon: <NfcIcon />,
          },
        },
      ];
    });
  }

  deactivate(): void {
    this.pluginStore.removeFunction(`${this.name}.GET_ROUTES`);
  }
}
