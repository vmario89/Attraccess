// apps/api/src/plugin-system/plugin.module.ts
import { Module, Global, DynamicModule } from '@nestjs/common';
import { PluginService } from './plugin.service';

@Global() // Make PluginService available globally
@Module({})
export class PluginModule {
  static async forRootAsync(): Promise<DynamicModule> {
    const pluginService = new PluginService();
    // Manually trigger loading before module definition is returned
    await pluginService.onModuleInit();
    const loadedPlugins = pluginService.getPluginModules();

    return {
      module: PluginModule,
      imports: [...loadedPlugins], // Import the dynamic modules returned by plugins
      providers: [
        {
          provide: PluginService,
          useValue: pluginService, // Use the instance that already loaded plugins
        },
      ],
      exports: [PluginService],
    };
  }
}
