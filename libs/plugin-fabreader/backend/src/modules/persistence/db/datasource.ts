import { DataSource, DataSourceOptions } from 'typeorm';
import { join, resolve } from 'path';

const storagePath = join(process.cwd(), 'storage');

// Migrations
import { Init1745783167785 } from './migrations/1745783167785-init';
import { NfcCardEntitySimplification1746124147271 } from './migrations/1746124147271-nfc-card-entity-simplification';
import { NfcCardKeyPrefix1746124521038 } from './migrations/1746124521038-nfc-card-key-prefix';

// Entities
import { Reader } from './entities/reader.entity';
import { NFCCard } from './entities/nfcCard.entity';

export const FABREADER_DB_DATASOURCE_NAME = 'FABREADER_DB';

const dbFile = resolve(storagePath, 'fabreader.sqlite');

export const datasourceConfig: DataSourceOptions = {
  type: 'sqlite',
  synchronize: false,
  migrations: [Init1745783167785, NfcCardEntitySimplification1746124147271, NfcCardKeyPrefix1746124521038],
  migrationsTableName: 'migrations',
  migrationsRun: true,
  entities: [Reader, NFCCard],
  database: dbFile,
  name: FABREADER_DB_DATASOURCE_NAME,
};

export default new DataSource(datasourceConfig);
