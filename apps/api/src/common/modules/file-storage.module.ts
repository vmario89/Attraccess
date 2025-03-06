import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { FileStorageService } from '../services/file-storage.service';
import { ResourceImageService } from '../services/resource-image.service';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  providers: [FileStorageService, ResourceImageService],
  exports: [FileStorageService, ResourceImageService],
})
export class FileStorageModule {}
