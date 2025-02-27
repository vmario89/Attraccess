import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersAndAuthModule } from '../users-and-auth/users-and-auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceConfig } from '../database/datasource';
import { ResourcesModule } from '../resources/resources.module';
import { ConfigModule } from '@nestjs/config';
import { storageConfig } from '../config/storage.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [storageConfig],
      isGlobal: true,
    }),
    UsersAndAuthModule,
    TypeOrmModule.forRoot(dataSourceConfig),
    ResourcesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
