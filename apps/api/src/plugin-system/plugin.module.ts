import { User } from '@attraccess/database-entities';
import { PluginApiModule, PluginApiService } from '@attraccess/plugins';
import { DynamicModule, Global, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import { createRequire } from 'module';
import * as path from 'path';

export const PLUGIN_PATH = path.resolve(process.env.PLUGIN_DIR ?? path.join(__dirname, '..', 'plugins'));

@Global()
@Module({})
export class PluginModule {
  private static pluginManifests: PluginManifest[];

  public static forRoot(): DynamicModule {
    this.pluginManifests = this.findPluginsInFolder(PLUGIN_PATH);
    Logger.log(`Found ${this.pluginManifests.length} plugins in ${PLUGIN_PATH}`, 'LoadPlugins');
    const pluginModules = this.pluginManifests.map((manifest) => {
      return PluginModule.loadPluginModule(manifest);
    });

    return {
      module: PluginModule,
      providers: [PluginApiService],
      imports: [PluginApiModule, ...pluginModules],
      exports: [PluginApiService],
    };
  }

  private static loadPluginModule(manifest: PluginManifest): DynamicModule {
    const pluginRequire = createRequire(__filename);
    const importedModule = pluginRequire(manifest.main);

    Logger.log(`Imported module: ${manifest.name}`, 'LoadPlugins');

    return importedModule.default;
  }

  private static findPluginsInFolder(folder: string): PluginManifest[] {
    const folders = fs.readdirSync(folder);

    Logger.log(`Found ${folders.length} folders in ${folder}`, 'LoadPlugins');

    return folders
      .map((folderName) => this.findPluginManifestInPluginFolder(path.join(folder, folderName)))
      .filter((manifest) => manifest !== null);
  }

  private static findPluginManifestInPluginFolder(folder: string): PluginManifest {
    const manifestPath = path.join(folder, 'plugin.json');

    if (!fs.existsSync(manifestPath)) {
      Logger.log(`No manifest found at ${manifestPath}`, 'LoadPlugins');
      return null;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    manifest.main = path.join(folder, manifest.main);

    return manifest;
  }
}

interface PluginManifest {
  name: string;
  main: string;
  version: string;
  description: string;
  attraccessVersion: {
    min?: string;
    max?: string;
    exact?: string;
  };
}
