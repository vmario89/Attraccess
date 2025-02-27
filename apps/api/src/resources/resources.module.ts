import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Resource,
  ResourceUsage,
  ResourceIntroduction,
  ResourceIntroductionUser,
  User,
} from '@attraccess/database-entities';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { ResourcePermissionsGuard } from './guards/resourcePermissions.guard';
import { ResourceUsageController } from './usage/resourceUsage.controller';
import { ResourceUsageService } from './usage/resourceUsage.service';
import { ScheduleModule } from '@nestjs/schedule';
import { FileStorageModule } from '../common/modules/file-storage.module';
import { ResourceImageService } from '../common/services/resource-image.service';
import { ResourceIntroductionController } from './introduction/resourceIntroduction.controller';
import { ResourceIntroductionService } from './introduction/resourceIntroduction.service';
import { UsersAndAuthModule } from '../users-and-auth/users-and-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resource,
      ResourceUsage,
      ResourceIntroduction,
      ResourceIntroductionUser,
      User,
    ]),
    ScheduleModule.forRoot(),
    FileStorageModule,
    UsersAndAuthModule,
  ],
  controllers: [
    ResourcesController,
    ResourceUsageController,
    ResourceIntroductionController,
  ],
  providers: [
    ResourcesService,
    ResourceImageService,
    ResourceUsageService,
    ResourcePermissionsGuard,
    ResourceIntroductionService,
  ],
  exports: [
    ResourcesService,
    ResourceUsageService,
    ResourceIntroductionService,
  ],
})
export class ResourcesModule {}
