import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersAndAuthModule } from '../users-and-auth/users-and-auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceConfig } from '../database/datasource';
import { ResourcesModule } from '../resources/resources.module';
import { ConfigModule } from '@nestjs/config';
import { storageConfig } from '../config/storage.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve, join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [storageConfig],
      isGlobal: true,
    }),
    UsersAndAuthModule,
    TypeOrmModule.forRoot(dataSourceConfig),
    ResourcesModule,
    ServeStaticModule.forRoot({
      rootPath:
        process.env.STATIC_FRONTEND_FILE_PATH ||
        resolve(join(__dirname, 'public')),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
