// typeorm.config.ts

import { DataSource, DataSourceOptions } from 'typeorm';
import { loadEnv } from '@attraccess/env';
import { join, resolve } from 'path';
import { entities } from './entities';

// TypeScript declaration for webpack's require.context
declare const require: {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ): {
    keys(): string[];
    <T>(id: string): T;
  };
};

// Use webpack's require.context for glob imports
// This will be processed by webpack during build time
const migrationContext = require.context('./migrations', false, /\.ts$/);

// Extract and transform migration classes from the context
const migrations = migrationContext.keys().map((fileName) => {
  const migration = migrationContext(fileName);
  return Object.values(migration)[0];
});

const envType = loadEnv((z) => ({
  DB_TYPE: z.enum(['postgres', 'sqlite']).default('sqlite'),
}));

let dbConfig: DataSourceOptions = {
  type: envType.DB_TYPE,
  synchronize: false,
  migrations: migrations,
  migrationsTableName: 'migrations',
  migrationsRun: true,
  entities: Object.values(entities),
};

function loadPostgresConfig() {
  const env = loadEnv((z) => ({
    DB_HOST: z.string(),
    DB_PORT: z
      .string()
      .refine((port) => parseInt(port) > 0 && parseInt(port) < 65536)
      .transform((port) => parseInt(port)),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_DATABASE: z.string(),
  }));

  dbConfig = {
    ...dbConfig,
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  } as DataSourceOptions;
}

function loadSqliteConfig() {
  const env = loadEnv((z) => ({
    DB_FILE: z.string().default('attraccess.sqlite'),
  }));

  dbConfig = {
    ...dbConfig,
    type: 'sqlite',
    database: resolve(join(__dirname, '..', '..', '..', env.DB_FILE)),
  } as DataSourceOptions;
}

switch (envType.DB_TYPE) {
  case 'postgres':
    loadPostgresConfig();
    break;

  case 'sqlite':
    loadSqliteConfig();
    break;

  default:
    throw new Error('Unknown Database type in DB_TYPE env');
}

export const dataSourceConfig = dbConfig;

console.log('dbConfig', dbConfig);

export default new DataSource(dataSourceConfig);
