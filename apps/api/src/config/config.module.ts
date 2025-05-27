import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { storageConfig } from './storage.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [storageConfig],
      // Cache the configuration
      cache: true,
      // Make configuration available everywhere
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
