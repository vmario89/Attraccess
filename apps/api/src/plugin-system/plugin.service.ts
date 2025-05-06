import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { join, resolve } from 'path';
import { PluginManifest, PluginManifestSchema, LoadedPluginManifest } from './plugin.manifest';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { FileUpload } from '../common/types/file-upload.types';
import { rename, rm } from 'fs/promises';
import decompress from 'decompress';
import { nanoid } from 'nanoid';
import { spawn } from 'child_process';

export class PluginService {
  public static readonly PLUGIN_PATH = resolve(process.env.PLUGIN_DIR ?? join(__dirname, '..', 'plugins'));
  private static plugins: LoadedPluginManifest[] | null = null;
  private static loadedPlugins: Set<string> = new Set();
  private static pluginLoadErrors: Map<string, Error> = new Map();
  private static logger = new Logger(PluginService.name);

  public static getPlugins(): LoadedPluginManifest[] {
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

  private static findPluginsInFolder(rootFolder: string): LoadedPluginManifest[] {
    // if folder does not exist, return empty array
    if (!existsSync(rootFolder)) {
      return [];
    }

    const potentialPluginFolders = readdirSync(rootFolder);

    PluginService.logger.log(`Found ${potentialPluginFolders.length} folders in ${rootFolder}`);

    return potentialPluginFolders
      .map((pluginFolder) => {
        const manifest = PluginService.findPluginManifestInPluginFolder(
          rootFolder,
          pluginFolder
        ) as LoadedPluginManifest | null;
        if (manifest) {
          manifest.pluginDirectory = pluginFolder;
          manifest.id = nanoid();
        }
        return manifest;
      })
      .filter((manifest) => manifest !== null);
  }

  private static findPluginManifestInPluginFolder(rootFolder: string, pluginFolder: string): PluginManifest | null {
    const manifestPath = join(rootFolder, pluginFolder, 'plugin.json');

    if (!existsSync(manifestPath)) {
      PluginService.logger.log(`No manifest found at ${manifestPath}`);
      return null;
    }

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

    if (manifest.main.backend) {
      manifest.main.backend = join(pluginFolder, manifest.main.backend);
    }

    if (manifest.main.frontend) {
      manifest.main.frontend.directory = join(pluginFolder, manifest.main.frontend.directory);
    }

    return manifest;
  }

  public async uploadPlugin(zipFile: FileUpload, overwrite = false) {
    // check if file is a zip file
    if (zipFile.mimetype !== 'application/zip') {
      PluginService.logger.error(`File ${zipFile.originalname} is not a zip file`);
      throw new BadRequestException('File must be a zip file');
    }

    // unzip file
    PluginService.logger.debug(`Unzipping file ${zipFile.originalname}`);
    const tempFolder = join(PluginService.PLUGIN_PATH, 'temp', nanoid());
    await decompress(zipFile.buffer, tempFolder);

    const uncompressedFolder = join(
      tempFolder,
      zipFile.originalname.substring(0, zipFile.originalname.length - '.zip'.length)
    );

    // read manifest
    PluginService.logger.debug(`Reading manifest from ${uncompressedFolder}`);
    const manifestPath = join(uncompressedFolder, 'plugin.json');
    const manifestContent = JSON.parse(readFileSync(manifestPath, 'utf8'));

    // validate manifest
    PluginService.logger.debug(`Validating manifest`, manifestContent);
    const manifest = PluginManifestSchema.parse(manifestContent);

    // if folder exists, and overwrite is false, throw error
    const pluginFolder = join(PluginService.PLUGIN_PATH, manifest.name);
    PluginService.logger.debug(`Checking if plugin folder ${pluginFolder} exists`, pluginFolder);
    if (existsSync(pluginFolder)) {
      if (!overwrite) {
        PluginService.logger.error(`Plugin ${manifest.name} already exists, but overwrite is false`);
        throw new BadRequestException('Plugin already exists');
      }

      // delete folder
      PluginService.logger.debug(`Deleting plugin folder ${pluginFolder}`);
      await rm(pluginFolder, { recursive: true });
    }

    // move plugin to plugins folder
    PluginService.logger.debug(`Moving plugin to plugins folder ${pluginFolder}`);
    await rename(uncompressedFolder, pluginFolder);

    // restart app in 1 second
    setTimeout(() => {
      this.restartApp();
    }, 1000);

    // return manifest
    PluginService.logger.debug(`Returning manifest ${manifest}`);
    return manifest;
  }

  private restartApp() {
    PluginService.logger.log('Restarting app');
    const subprocess = spawn(process.argv[0], process.argv.slice(1), {
      detached: true,
      stdio: 'inherit',
    });
    subprocess.unref();
    PluginService.logger.log('New process started, exiting current process');
    process.exit();
  }

  public async deletePlugin(pluginId: string) {
    const plugin = PluginService.getPlugins().find((plugin) => plugin.id === pluginId);

    if (!plugin) {
      PluginService.logger.error(`Plugin with id ${pluginId} not found`);
      throw new NotFoundException('Plugin not found');
    }

    const pluginFolder = join(PluginService.PLUGIN_PATH, plugin.pluginDirectory);

    // if folder does not exist, throw error
    if (!existsSync(pluginFolder)) {
      PluginService.logger.error(`Plugin folder ${pluginFolder} of plugin ${plugin.name} not found`);
      throw new NotFoundException('Plugin not found');
    }

    // delete folder
    await rm(pluginFolder, { recursive: true });

    // restart app
    setTimeout(() => {
      this.restartApp();
    }, 1000);
  }
}
