import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { FileStorageService } from '../services/file-storage.service';
import { ResourceImageService } from '../services/resource-image.service';
import { ImageProcessingService } from '../services/image-processing.service';
import { ImageCleanupService } from '../services/image-cleanup.service';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  providers: [
    FileStorageService,
    ResourceImageService,
    ImageProcessingService,
    ImageCleanupService,
  ],
  exports: [FileStorageService, ResourceImageService, ImageProcessingService],
})
export class FileStorageModule {}
