import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageConfig } from '../../config/storage.config';

@Injectable()
export class ImageCleanupService {
  private readonly logger = new Logger(ImageCleanupService.name);
  private readonly config: StorageConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.get<StorageConfig>('storage');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupUnusedCache() {
    this.logger.log('Starting cleanup of unused cached images');

    try {
      const now = Date.now();
      const maxAge = this.config.cache.maxAgeDays * 24 * 60 * 60 * 1000;
      let deletedCount = 0;
      let errorCount = 0;

      // Get all resource directories in cache
      const resourceDirs = await fs.readdir(
        path.join(this.config.cache.directory, 'resources')
      );

      for (const resourceId of resourceDirs) {
        const resourcePath = path.join(
          this.config.cache.directory,
          'resources',
          resourceId
        );

        try {
          const variants = await fs.readdir(resourcePath);

          for (const variant of variants) {
            const variantPath = path.join(resourcePath, variant);
            const stats = await fs.stat(variantPath);

            // If directory is older than maxAge, remove it
            if (now - stats.mtime.getTime() > maxAge) {
              await fs.rm(variantPath, { recursive: true, force: true });
              deletedCount++;
            }
          }

          // Clean up empty resource directories
          const remainingVariants = await fs.readdir(resourcePath);
          if (remainingVariants.length === 0) {
            await fs.rmdir(resourcePath);
          }
        } catch (error) {
          this.logger.error(
            `Error cleaning up resource ${resourceId}: ${error.message}`
          );
          errorCount++;
        }
      }

      this.logger.log(
        `Cleanup completed. Deleted ${deletedCount} cached variants. Errors: ${errorCount}`
      );
    } catch (error) {
      this.logger.error('Failed to cleanup cached images', error.stack);
    }
  }
}
