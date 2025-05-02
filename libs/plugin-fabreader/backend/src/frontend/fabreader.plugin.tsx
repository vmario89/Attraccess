import React from 'react';
import { FRONTEND_FUNCTION, getPluginFunctionName } from '@attraccess/plugins';
import { IPlugin, PluginStore } from 'react-pluggable';
import { FabreaderList } from './components/FabreaderList';

export class FabreaderPlugin implements IPlugin {
  public pluginStore!: PluginStore;
  public readonly name = 'Fabreader';
  public readonly version = 'v0.0.1';

  getPluginName(): string {
    return `${this.name}@${this.version}`;
  }

  getDependencies(): string[] {
    return ['RendererPlugin'];
  }

  init(pluginStore: PluginStore): void {
    this.pluginStore = pluginStore;
  }

  activate(): void {
    this.pluginStore.addFunction(getPluginFunctionName(this.name, FRONTEND_FUNCTION.GET_ROUTES), () => {
      return [
        {
          path: '/fabreader',
          component: <FabreaderList />,
        },
      ];
    });
  }

  deactivate(): void {
    this.pluginStore.removeFunction(getPluginFunctionName(this.name, FRONTEND_FUNCTION.GET_ROUTES));
  }
}
