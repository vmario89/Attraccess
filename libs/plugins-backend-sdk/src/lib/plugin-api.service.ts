import { InjectionToken, Injectable } from '@nestjs/common';
import { DataSource, ObjectLiteral } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { entities } from '@attraccess/database-entities';

@Injectable()
export class PluginApiService {
  public constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  public getRepository<TEntity extends ObjectLiteral>(entityName: keyof typeof entities) {
    return this.dataSource.getRepository<TEntity>(entities[entityName]);
  }
}

export const PLUGIN_API_SERVICE = 'PLUGIN_API_SERVICE' as InjectionToken<PluginApiService>;
