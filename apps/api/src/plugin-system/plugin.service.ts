import { Logger } from '@nestjs/common';
import { join, resolve } from 'path';
import { PluginManifest } from './plugin.manifest';
import { existsSync, readdirSync, readFileSync } from 'fs';

export class PluginService {
  public static readonly PLUGIN_PATH = resolve(process.env.PLUGIN_DIR ?? join(__dirname, '..', 'plugins'));
  private static plugins: PluginManifest[] | null = null;
  private static loadedPlugins: Set<string> = new Set();
  private static pluginLoadErrors: Map<string, Error> = new Map();
  private static logger = new Logger(PluginService.name);

  public static getPlugins(): PluginManifest[] {
    if (!PluginService.plugins) {
      PluginService.plugins = PluginService.findPluginsInFolder(PluginService.PLUGIN_PATH);
      PluginService.logger.log(`Found ${PluginService.plugins.length} plugins in ${PluginService.PLUGIN_PATH}`);
    }

    return PluginService.plugins;
  }

  public static markPluginAsLoaded(pluginName: string): void {
    PluginService.logger.log(`Marking plugin ${pluginName} as loaded`);
    PluginService.loadedPlugins.add(pluginName);
  }

  public static setPluginLoadError(pluginName: string, error: Error): void {
    PluginService.logger.error(`Error loading plugin ${pluginName}: ${error.message}`);
    PluginService.pluginLoadErrors.set(pluginName, error);
  }

  private static findPluginsInFolder(rootFolder: string): PluginManifest[] {
    // if folder does not exist, return empty array
    if (!existsSync(rootFolder)) {
      return [];
    }

    const potentialPluginFolders = readdirSync(rootFolder);

    PluginService.logger.log(`Found ${potentialPluginFolders.length} folders in ${rootFolder}`);

    return potentialPluginFolders
      .map((pluginFolder) => PluginService.findPluginManifestInPluginFolder(rootFolder, pluginFolder))
      .filter((manifest) => manifest !== null);
  }

  private static findPluginManifestInPluginFolder(rootFolder: string, pluginFolder: string): PluginManifest | null {
    const manifestPath = join(rootFolder, pluginFolder, 'plugin.json');

    if (!existsSync(manifestPath)) {
      PluginService.logger.log(`No manifest found at ${manifestPath}`);
      return null;
    }

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

    manifest.main.backend = join(pluginFolder, manifest.main.backend);
    manifest.main.frontend = join(pluginFolder, manifest.main.frontend);

    return manifest;
  }
}
