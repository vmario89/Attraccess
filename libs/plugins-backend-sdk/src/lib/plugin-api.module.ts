import { Global, Module } from '@nestjs/common';
import { PLUGIN_API_SERVICE, PluginApiService } from './plugin-api.service';

@Global()
@Module({
  providers: [
    {
      provide: PLUGIN_API_SERVICE,
      useClass: PluginApiService,
    },
  ],
  exports: [PLUGIN_API_SERVICE],
})
export class PluginApiModule {}
