import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersAndAuthModule } from '../users-and-auth/users-and-auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceConfig } from '../database/datasource';
import { ResourcesModule } from '../resources/resources.module';
import { ConfigModule } from '@nestjs/config';
import { storageConfig } from '../config/storage.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve, join } from 'path';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MqttModule } from '../mqtt/mqtt.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { Module } from '@nestjs/common';
import { PluginModule } from '../plugin-system/plugin.module';
import { FabReaderModule } from '../fabreader/fabreader.module';
import { AnalyticsModule } from '../analytics/analytics.module';

const frontendPath = resolve(process.env.STATIC_FRONTEND_FILE_PATH || join(__dirname, 'public'));
console.log('Serving frontend from ', frontendPath);

const docsPath = resolve(process.env.STATIC_DOCS_FILE_PATH || join(__dirname, 'docs'));
console.log('Serving docs from: ', docsPath);

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [storageConfig],
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    UsersAndAuthModule,
    TypeOrmModule.forRoot(dataSourceConfig),
    ResourcesModule,
    MqttModule,
    WebhooksModule,
    ServeStaticModule.forRoot({
      rootPath: docsPath,
      serveRoot: '/docs',
    }),
    ServeStaticModule.forRoot({
      rootPath: frontendPath,
    }),
    PluginModule.forRoot(),
    FabReaderModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
