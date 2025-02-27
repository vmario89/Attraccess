import * as path from 'path';
import { loadEnv } from '@attraccess/env';

// Core environment variables validated at startup
export const env = loadEnv((z) => ({
  STORAGE_ROOT: z.string().default(path.join(process.cwd(), 'storage')),
  MAX_FILE_SIZE_BYTES: z.number().default(10 * 1024 * 1024), // 10MB
  CACHE_MAX_AGE_DAYS: z.number().default(7),
}));

// Runtime configuration that can be overridden
export const storageConfig = () => ({
  storage: {
    root: env.STORAGE_ROOT,
    maxFileSize: env.MAX_FILE_SIZE_BYTES,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
    cache: {
      maxAgeDays: env.CACHE_MAX_AGE_DAYS,
      directory: path.join(env.STORAGE_ROOT, 'cache'),
    },
    resources: {
      directory: path.join(env.STORAGE_ROOT, 'resources'),
    },
  },
});

// Type definitions for strongly typed access
export type StorageConfig = ReturnType<typeof storageConfig>['storage'];
export type AllowedMimeType = StorageConfig['allowedMimeTypes'][number];
