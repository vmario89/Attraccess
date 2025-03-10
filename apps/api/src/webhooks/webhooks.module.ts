import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookConfig, Resource } from '@attraccess/database-entities';
import { WebhookConfigController } from './config/webhook-config.controller';
import { WebhookConfigService } from './config/webhook-config.service';
import { WebhookPublisherService } from './publisher/webhook-publisher.service';
import { ConfigModule } from '@nestjs/config';
import { ResourcesCoreModule } from '../resources/resources-core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookConfig, Resource]),
    ConfigModule,
    ResourcesCoreModule,
  ],
  controllers: [WebhookConfigController],
  providers: [WebhookConfigService, WebhookPublisherService],
  exports: [WebhookPublisherService],
})
export class WebhooksModule {}
