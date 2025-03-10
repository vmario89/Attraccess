import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource, User } from '@attraccess/database-entities';
import { ResourcesService } from './resources.service';
import { FileStorageModule } from '../common/modules/file-storage.module';
import { ResourceImageService } from '../common/services/resource-image.service';
import { CanManageResourcesGuard } from './guards/can-manage-resources.guard';

/**
 * Core module that provides ResourcesService and related guards
 * This module can be imported by other modules that need these services
 * without creating circular dependencies
 */
@Module({
  imports: [TypeOrmModule.forFeature([Resource, User]), FileStorageModule],
  providers: [ResourcesService, ResourceImageService, CanManageResourcesGuard],
  exports: [ResourcesService, CanManageResourcesGuard],
})
export class ResourcesCoreModule {}
