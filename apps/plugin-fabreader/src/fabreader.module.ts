import { Module } from '@nestjs/common';
import { FabreaderController } from './fabreader.controller';
import { FABREADER_DB_DATASOURCE_NAME } from './modules/persistence/db/datasource';
import { TypeOrmModule } from '@nestjs/typeorm';
import { datasourceConfig } from './modules/persistence/db/datasource';
import { Reader } from './modules/persistence/db/entities/reader.entity';
import { FabreaderService } from './fabreader.service';
import { NFCCard } from './modules/persistence/db/entities/nfcCard.entity';
import { DbService } from './modules/persistence/db.service';
import { WebsocketService } from './modules/websockets/websocket.service';
import { FabreaderGateway } from './modules/websockets/websocket.gateway';

@Module({
  imports: [
    TypeOrmModule.forRoot(datasourceConfig),
    TypeOrmModule.forFeature([Reader, NFCCard], FABREADER_DB_DATASOURCE_NAME),
  ],
  providers: [FabreaderService, DbService, WebsocketService, FabreaderGateway],
  controllers: [FabreaderController],
})
export default class FabReaderModule {}
