import { Controller, Get, Logger, NotFoundException, Param, StreamableFile } from '@nestjs/common';
import { PluginService } from './plugin.service';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PluginManifest } from './plugin.manifest';

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

  @Get(':pluginName/frontend/plugin.js')
  @ApiOperation({ summary: 'Get frontend plugin.js file', operationId: 'getFrontendPluginJsFile' })
  @ApiResponse({
    status: 200,
    description: 'The frontend plugin.js file',
    type: String,
  })
  getFrontendPluginJsFile(@Param('pluginName') pluginName: string) {
    const plugins = PluginService.getPlugins();
    const plugin = plugins.find((plugin) => plugin.name === pluginName);
    if (!plugin) {
      throw new NotFoundException(`Plugin ${pluginName} not found`);
    }

    const filePath = join(PluginService.PLUGIN_PATH, plugin.main.frontend);
    if (!existsSync(filePath)) {
      throw new NotFoundException(`Frontend plugin.js file not found for plugin ${pluginName}`);
    }

    this.logger.log(`Serving frontend plugin.js file for plugin ${pluginName} from ${filePath}`);

    // stream the file
    const fileStream = createReadStream(filePath);
    return new StreamableFile(fileStream, {
      type: 'application/javascript',
    });
  }
}
