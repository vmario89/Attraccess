import { PluginApiModule, PluginApiService } from '@attraccess/plugins-backend-sdk';
import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { createRequire } from 'module';
import { PluginManifest } from './plugin.manifest';
import { PluginService } from './plugin.service';
import { PluginController } from './plugin.controller';
import { join } from 'path';

@Global()
@Module({})
export class PluginModule {
  private static pluginManifests: PluginManifest[];
  private static logger = new Logger(PluginModule.name);

  public static forRoot(): DynamicModule {
    this.pluginManifests = PluginService.getPlugins();

    const pluginModules = this.pluginManifests
      .map((manifest) => {
        try {
          const module = PluginModule.loadPluginModule(manifest);
          PluginService.markPluginAsLoaded(`${manifest.name}@${manifest.version}`);
          return module;
        } catch (error) {
          this.logger.error(`Error loading plugin ${manifest.name}`, error);
          PluginService.setPluginLoadError(`${manifest.name}@${manifest.version}`, error as Error);
          return null;
        }
      })
      .filter((module) => module !== null);

    return {
      module: PluginModule,
      providers: [PluginApiService, PluginService],
      imports: [PluginApiModule, ...pluginModules],
      exports: [PluginApiService],
      controllers: [PluginController],
    };
  }

  private static loadPluginModule(manifest: PluginManifest): DynamicModule {
    this.logger.log(`Loading plugin ${manifest.name} from ${manifest.main.backend}`);

    if (!manifest.main.backend) {
      this.logger.error(`Plugin ${manifest.name} has no backend, skipping backend module loading`);
      return null;
    }

    const pluginRequire = createRequire(__filename);
    const importedModule = pluginRequire(join(PluginService.PLUGIN_PATH, manifest.main.backend));

    this.logger.log(`Imported module: ${manifest.name}`);

    return importedModule.default;
  }
}
