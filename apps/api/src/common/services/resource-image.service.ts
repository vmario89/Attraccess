import { Injectable } from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { FileUpload } from '../types/file-upload.types';
import { ConfigService } from '@nestjs/config';
import { StorageConfig } from '../../config/storage.config';
import * as path from 'path';

@Injectable()
export class ResourceImageService {
  private readonly config: StorageConfig;

  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.get<StorageConfig>('storage');
  }

  private getResourceSubDirectory(resourceId: number): string {
    return path.join('resources', resourceId.toString(), 'original');
  }

  async saveImage(resourceId: number, file: FileUpload): Promise<string> {
    const subDirectory = this.getResourceSubDirectory(resourceId);
    return this.fileStorageService.saveFile(file, subDirectory);
  }

  async deleteImage(resourceId: number, filename: string): Promise<void> {
    const subDirectory = this.getResourceSubDirectory(resourceId);
    await this.fileStorageService.deleteFile(subDirectory, filename);

    // Clean up any cached versions
    await this.fileStorageService.clearCache(
      path.join('resources', resourceId.toString())
    );
  }

  async getImagePath(resourceId: number, filename: string): Promise<string> {
    const subDirectory = this.getResourceSubDirectory(resourceId);
    return this.fileStorageService.getFilePath(subDirectory, filename);
  }

  getPublicPath(resourceId: number, filename: string): string {
    const subDirectory = this.getResourceSubDirectory(resourceId);
    return this.fileStorageService.getPublicPath(subDirectory, filename);
  }
}
