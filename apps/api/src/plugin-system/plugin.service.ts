// apps/api/src/plugin-system/plugin.service.ts
import { Injectable, Logger, OnModuleInit, DynamicModule } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createRequire } from 'node:module';
import {
  BlockableSystemEventResponse,
  PluginInterface,
  SemanticVersion,
  SystemEvent,
  SystemEventPayload,
  SystemEventResponse,
} from '@attraccess/plugins';
import { resolve } from 'path';

// Define the expected structure of plugin.json
interface PluginManifest {
  name: string;
  main: string;
  attraccessVersion:
    | {
        min: string;
        max: string;
      }
    | {
        exact: string;
      };
  // Add other metadata fields as needed, e.g., version, description
}

interface PluginRegistryEntry {
  instance: PluginInterface;
  module: DynamicModule;
  name: string; // Store name for logging
}

@Injectable()
export class PluginService implements OnModuleInit {
  private readonly logger = new Logger(PluginService.name);
  private readonly pluginsDir = path.resolve(process.env.PLUGIN_DIR ?? path.join(__dirname, '..', 'plugins')); // Adjust if your structure differs
  // Store both instance and module, along with the name
  private pluginRegistry: PluginRegistryEntry[] = [];

  async onModuleInit() {
    this.logger.log(`Scanning for plugins in ${this.pluginsDir}`);
    await this.loadPlugins();
  }

  private async loadPlugins() {
    const packageJsonContent = await fs.readFile(resolve('package.json'), 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    const attraccessVersion = SemanticVersion.fromString(packageJson.version);
    this.logger.log(
      `Starting plugin loading process from directory: ${this.pluginsDir} (Attraccess version: ${attraccessVersion})`
    );
    try {
      const pluginFolders = await fs.readdir(this.pluginsDir, { withFileTypes: true });
      this.logger.debug(`Found ${pluginFolders.length} entries in plugins directory.`);

      for (const dirent of pluginFolders) {
        if (dirent.isDirectory()) {
          const pluginFolderName = dirent.name;
          const pluginPath = path.join(this.pluginsDir, pluginFolderName);
          this.logger.debug(`Processing potential plugin directory: ${pluginFolderName} at ${pluginPath}`);

          const manifestPath = path.join(pluginPath, 'plugin.json');
          this.logger.debug(`Checking for manifest file: ${manifestPath}`);

          try {
            // 1. Read plugin.json
            const manifestContent = await fs.readFile(manifestPath, 'utf-8');
            const manifest: PluginManifest = JSON.parse(manifestContent);
            this.logger.verbose(`Read manifest for ${pluginFolderName}:`, manifest);

            if (!manifest.attraccessVersion) {
              this.logger.warn(`Skipping ${pluginFolderName}: No attraccessVersion specified in manifest.`);
              continue;
            }

            const minVersionString = (manifest.attraccessVersion as { min: string }).min;
            const maxVersionString = (manifest.attraccessVersion as { max: string }).max;
            const exactVersionString = (manifest.attraccessVersion as { exact: string }).exact;

            if (exactVersionString) {
              const match = attraccessVersion.equals(exactVersionString);
              if (!match) {
                this.logger.warn(
                  `Plugin ${pluginFolderName} is not compatible with this version of Attraccess. Required version: ${exactVersionString}, Current version: ${attraccessVersion}`
                );
                continue;
              }
            } else {
              if (minVersionString) {
                const match = attraccessVersion.isGreaterThanOrEqualTo(minVersionString);
                if (!match) {
                  this.logger.warn(
                    `Plugin ${pluginFolderName} is not compatible with this version of Attraccess. Required version: ${minVersionString}, Current version: ${attraccessVersion}`
                  );
                  continue;
                }
              }

              if (maxVersionString) {
                const match = attraccessVersion.isLessThanOrEqualTo(maxVersionString);
                if (!match) {
                  this.logger.warn(
                    `Plugin ${pluginFolderName} is not compatible with this version of Attraccess. Required version: ${maxVersionString}, Current version: ${attraccessVersion}`
                  );
                  continue;
                }
              }
            }

            // 2. Validate manifest
            if (!manifest.name || !manifest.main) {
              this.logger.warn(
                `Skipping ${pluginFolderName}: Invalid manifest file. 'name' and 'main' properties are required.`
              );
              continue; // Skip this directory
            }

            // 3. Construct entry point path
            // Ensure manifest.main is treated as relative to the plugin's directory
            const pluginModulePath = path.resolve(pluginPath, manifest.main);
            this.logger.debug(`Resolved plugin entry point for ${manifest.name}: ${pluginModulePath}`);

            // 4. Check if entry point exists
            try {
              await fs.access(pluginModulePath);
              this.logger.verbose(`Confirmed entry point exists: ${pluginModulePath}`);
            } catch {
              this.logger.error(
                `Skipping ${manifest.name} (${pluginFolderName}): Entry point specified in manifest not found or inaccessible: ${pluginModulePath}`
              );
              continue; // Skip this directory
            }

            // 5. Import and load plugin
            this.logger.debug(`Attempting to load module using createRequire: ${pluginModulePath}`);
            try {
              // Create a require function relative to the current module's directory
              // Use __filename as it's more commonly available in Node/bundled environments
              const pluginRequire = createRequire(__filename);
              // Use the custom require function
              const pluginModule = pluginRequire(pluginModulePath);
              this.logger.debug(`Successfully required module via createRequire: ${pluginModulePath}`);

              // Adjust check for CommonJS vs ES Module default export if needed
              // If plugins are CommonJS: const PluginClass = pluginModule;
              // If plugins are ES Modules compiled to CommonJS: const PluginClass = pluginModule.default;
              // Let's assume they are ES Modules compiled to CommonJS for now based on original code:
              const PluginClass = pluginModule.default;

              if (PluginClass && typeof PluginClass === 'function') {
                this.logger.debug(
                  `Found export class in ${pluginModulePath}. Attempting instantiation for plugin: ${manifest.name}`
                );
                const pluginInstance: PluginInterface = new PluginClass();
                this.logger.debug(
                  `Successfully instantiated plugin class from ${pluginModulePath} for plugin: ${manifest.name}`
                );

                // Validate instance has the 'load' method
                if (pluginInstance.load && typeof pluginInstance.load === 'function') {
                  this.logger.log(`Loading plugin: ${manifest.name} from ${pluginFolderName}`); // Use name from manifest
                  const dynamicModule = await pluginInstance.load(attraccessVersion);
                  // Store the instance, module, and name
                  this.pluginRegistry.push({
                    instance: pluginInstance,
                    module: dynamicModule,
                    name: manifest.name,
                  });
                  this.logger.log(`Successfully loaded and registered plugin: ${manifest.name}`);
                } else {
                  this.logger.warn(
                    `Skipping ${manifest.name} (${pluginFolderName}): Invalid plugin structure in ${pluginModulePath}. Instance does not have a valid 'load' method.`
                  );
                }
              } else {
                this.logger.warn(
                  `Skipping ${manifest.name} (${pluginFolderName}): No valid default export class found in ${pluginModulePath}.`
                );
              }
            } catch (error) {
              this.logger.error(
                `Failed to load plugin ${manifest.name} from ${pluginFolderName} (${pluginModulePath}): ${error.message}`,
                error.stack
              );
            }
          } catch (error) {
            if (error.code === 'ENOENT') {
              this.logger.debug(`No manifest file found in ${pluginFolderName}. Skipping directory.`);
            } else if (error instanceof SyntaxError) {
              this.logger.error(
                `Failed to parse manifest file in ${pluginFolderName}: ${manifestPath}. Error: ${error.message}`
              );
            } else {
              this.logger.error(
                `Failed to read or process manifest file in ${pluginFolderName}: ${manifestPath}. Error: ${error.message}`,
                error.stack
              );
            }
            // Continue to the next directory even if manifest reading fails for one
          }
        } else {
          this.logger.debug(`Skipping non-directory entry: ${dirent.name}`);
        }
      }
    } catch (error) {
      // If plugins directory doesn't exist, log a warning but don't crash
      if (error.code === 'ENOENT') {
        this.logger.warn(`Plugins directory not found: ${this.pluginsDir}. No plugins will be loaded.`);
      } else {
        this.logger.error(`Error scanning plugins directory: ${error.message}`, error.stack);
      }
    }
    this.logger.log(`Plugin loading complete. Loaded ${this.pluginRegistry.length} plugins.`);
  }

  /**
   * Returns the DynamicModules for all loaded plugins, suitable for NestJS module registration.
   */
  getPluginModules(): DynamicModule[] {
    return this.pluginRegistry.map((entry) => entry.module);
  }

  /**
   * Emits an event to all loaded plugins by calling their 'on' method sequentially.
   * @param eventName The name of the event.
   * @param payload The data associated with the event.
   */
  async emitEvent<TEvent extends SystemEvent>(
    eventName: TEvent,
    payload: SystemEventPayload[TEvent],
    isBlockable = false
  ): Promise<{ isBlocked: boolean; responses: SystemEventResponse[TEvent][] }> {
    this.logger.debug(`Emitting event '${eventName}' to ${this.pluginRegistry.length} plugins.`);
    // Store responses, though currently not used
    const responses: (SystemEventResponse[TEvent] | null)[] = [];
    for (const entry of this.pluginRegistry) {
      if (entry.instance.on && typeof entry.instance.on === 'function') {
        try {
          this.logger.verbose(`Calling 'on' for event '${eventName}' on plugin '${entry.name}'.`);
          // Await in case the 'on' method is async
          const response = await entry.instance.on(eventName, payload);
          responses.push(response);

          if (isBlockable && response && (response as BlockableSystemEventResponse).continue === false) {
            this.logger.debug(`Plugin '${entry.name}' blocked event '${eventName}'.`);
            break;
          }
        } catch (error) {
          this.logger.error(
            `Error calling 'on' method for event '${eventName}' on plugin '${entry.name}': ${error.message}`,
            error.stack
          );
          // Decide if you want to stop execution or continue to the next plugin
          // For now, we log the error and continue
        }
      } else {
        this.logger.verbose(`Plugin '${entry.name}' does not have an 'on' method. Skipping event '${eventName}'.`);
      }
    }
    this.logger.debug(`Finished emitting event '${eventName}'.`);

    // TODO: handle rollbacks
    return {
      isBlocked:
        isBlockable &&
        responses.filter((r) => !!r).some((response) => (response as BlockableSystemEventResponse)?.continue === false),
      responses,
    };
  }
}
