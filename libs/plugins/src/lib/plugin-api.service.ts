import { Logger, InjectionToken, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { entities } from '@attraccess/database-entities';

@Injectable()
export class PluginApiService {
  private readonly logger = new Logger(PluginApiService.name);

  public constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  public getRepository<TEntity>(entityName: keyof typeof entities) {
    this.logger.log(`PluginApiService getRepository() called`);
    return this.dataSource.getRepository<TEntity>(entities[entityName]);
  }
}

export const PLUGIN_API_SERVICE = 'PLUGIN_API_SERVICE' as InjectionToken<PluginApiService>;
