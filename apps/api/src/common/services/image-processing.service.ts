import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { StorageConfig } from '../../config/storage.config';

export interface ImageProcessingOptions {
  width: number;
  height: number;
  fit?: keyof sharp.FitEnum;
  format?: keyof sharp.FormatEnum;
  quality?: number;
}

const DEFAULT_OPTIONS: Partial<ImageProcessingOptions> = {
  fit: 'contain',
  format: 'webp',
  quality: 80,
};

const DIMENSION_LIMITS = {
  min: 16,
  max: 2000,
};

class ImageProcessingWidthLimitsError extends BadRequestException {
  constructor(cause: string) {
    super('ImageProcessingWidthLimitsError', {
      cause,
    });
  }
}

class ImageProcessingHeightLimitsError extends BadRequestException {
  constructor(cause: string) {
    super('ImageProcessingHeightLimitsError', {
      cause,
    });
  }
}

class ImageProcessingError extends BadRequestException {
  constructor(cause: string) {
    super('ImageProcessingError', {
      cause,
    });
  }
}

@Injectable()
export class ImageProcessingService {
  private readonly logger = new Logger(ImageProcessingService.name);
  private readonly config: StorageConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<StorageConfig>('storage');
  }

  private validateDimensions(width: number, height: number): void {
    if (width < DIMENSION_LIMITS.min || width > DIMENSION_LIMITS.max) {
      throw new ImageProcessingWidthLimitsError(
        `Width must be between ${DIMENSION_LIMITS.min} and ${DIMENSION_LIMITS.max} pixels`
      );
    }
    if (height < DIMENSION_LIMITS.min || height > DIMENSION_LIMITS.max) {
      throw new ImageProcessingHeightLimitsError(
        `Height must be between ${DIMENSION_LIMITS.min} and ${DIMENSION_LIMITS.max} pixels`
      );
    }
  }

  private generateOptionsHash(options: ImageProcessingOptions): string {
    const optionsString = JSON.stringify(options);
    return crypto.createHash('md5').update(optionsString).digest('hex');
  }

  private async ensureCacheDirectory(
    resourceId: number,
    optionsHash: string
  ): Promise<string> {
    const cacheDir = path.join(
      this.config.cache.directory,
      'resources',
      resourceId.toString(),
      optionsHash
    );

    await fs.mkdir(cacheDir, { recursive: true, mode: 0o755 });
    return cacheDir;
  }

  async processImage(
    resourceId: number,
    sourceFilePath: string,
    options: Partial<ImageProcessingOptions>
  ): Promise<string> {
    const fullOptions: ImageProcessingOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
      width: Math.round(options.width),
      height: Math.round(options.height),
    };

    this.validateDimensions(fullOptions.width, fullOptions.height);

    const optionsHash = this.generateOptionsHash(fullOptions);
    const cacheDir = await this.ensureCacheDirectory(resourceId, optionsHash);

    const sourceFilename = path.basename(sourceFilePath);
    const outputFilename =
      path.parse(sourceFilename).name + '.' + fullOptions.format;
    const outputPath = path.join(cacheDir, outputFilename);

    try {
      // Check if cached version exists
      await fs.access(outputPath);
      return outputPath;
    } catch {
      // Process and cache the image
      try {
        await sharp(sourceFilePath)
          .resize({
            width: fullOptions.width,
            height: fullOptions.height,
            fit: fullOptions.fit,
            withoutEnlargement: true,
          })
          .toFormat(fullOptions.format, {
            quality: fullOptions.quality,
            effort: 6, // Higher compression effort
          })
          .toFile(outputPath);

        return outputPath;
      } catch (error) {
        this.logger.error(
          `Error processing image: ${error.message}`,
          error.stack
        );
        throw new ImageProcessingError('Failed to process image');
      }
    }
  }

  getPublicPath(
    resourceId: number,
    options: Partial<ImageProcessingOptions>
  ): string {
    const { width, height, fit, format, quality } = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    const params = new URLSearchParams();

    if (fit !== DEFAULT_OPTIONS.fit) params.set('fit', fit);
    if (format !== DEFAULT_OPTIONS.format) params.set('format', format);
    if (quality !== DEFAULT_OPTIONS.quality)
      params.set('quality', quality.toString());

    const queryString = params.toString();
    return `/resources/${resourceId}/image/${width}x${height}${
      queryString ? '?' + queryString : ''
    }`;
  }
}
