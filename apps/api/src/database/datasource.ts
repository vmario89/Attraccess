// typeorm.config.ts

import { DataSource, DataSourceOptions } from 'typeorm';
import { loadEnv } from '@attraccess/env';
import { join } from 'path';
import { entities } from './entities';

const env = loadEnv((z) => ({
  DB_TYPE: z.enum(['postgres', 'mysql']),
  DB_HOST: z.string(),
  DB_PORT: z
    .string()
    .refine((port) => parseInt(port) > 0 && parseInt(port) < 65536)
    .transform((port) => parseInt(port)),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
}));

export const dataSourceConfig: DataSourceOptions = {
  type: env.DB_TYPE,
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  synchronize: false,
  migrations: [join(__dirname, 'migrations', '**', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  migrationsRun: true,
  entities: Object.values(entities),
};

export default new DataSource(dataSourceConfig);
