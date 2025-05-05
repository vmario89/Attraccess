import { Controller, Get, Logger, NotFoundException, Param, StreamableFile } from '@nestjs/common';
import { PluginService } from './plugin.service';
import { createReadStream, existsSync } from 'fs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PluginManifest } from './plugin.manifest';
import { join } from 'path';

@Controller('plugins')
export class PluginController {
  private readonly logger = new Logger(PluginController.name);

  @Get()
  @ApiOperation({ summary: 'Get all plugins', operationId: 'getPlugins' })
  @ApiResponse({
    status: 200,
    description: 'The list of all plugins',
    type: [PluginManifest],
  })
  getAllPlugins() {
    return PluginService.getPlugins();
  }

  // Also add support for loading the index.js file
  @Get(':pluginName/frontend/module-federation/*filePath')
  @ApiOperation({ summary: 'Get any frontend plugin file', operationId: 'getFrontendPluginFile' })
  @ApiResponse({
    status: 200,
    description: 'The requested frontend plugin file',
    type: String,
  })
  getFrontendPluginFile(@Param('pluginName') pluginName: string, @Param('filePath') filePath?: string) {
    const plugins = PluginService.getPlugins();
    const plugin = plugins.find((plugin) => plugin.name === pluginName);
    if (!plugin) {
      throw new NotFoundException(`Plugin ${pluginName} not found`);
    }

    const fileName = join(...filePath.split(','));

    // Path should point to the requested file in the plugin directory
    const pluginDir = join(PluginService.PLUGIN_PATH, plugin.main.frontend.directory);
    const fullFilePath = join(pluginDir, fileName);

    if (!existsSync(fullFilePath)) {
      this.logger.warn(`Frontend file ${fullFilePath} not found for plugin ${pluginName}`);
      throw new NotFoundException(`Frontend file ${fileName} not found for plugin ${pluginName}`);
    }

    this.logger.log(`Serving frontend file ${fileName} for plugin ${pluginName} from ${fullFilePath}`);

    // stream the file
    const fileStream = createReadStream(fullFilePath);
    return new StreamableFile(fileStream, {
      type: 'application/javascript',
    });
  }
}
