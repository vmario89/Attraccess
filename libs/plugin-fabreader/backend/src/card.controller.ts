import { Controller, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DbService } from './modules/persistence/db.service';
import { FabreaderGateway } from './modules/websockets/websocket.gateway';
import { Auth } from '@attraccess/plugins';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FabreaderService } from './fabreader.service';

@Controller('fabreader/cards')
export class ReaderController {
  public constructor(
    @Inject(DbService)
    private readonly dbService: DbService,
    @Inject(FabreaderGateway)
    private readonly fabreaderGateway: FabreaderGateway,
    @Inject(FabreaderService)
    private readonly fabreaderService: FabreaderService
  ) {}

  @Post(':cardUID/keys/:keyNo')
  @Auth()
  @ApiParam({ name: 'cardUID', type: String, description: 'The UID of the card to get the app key for' })
  @ApiParam({ name: 'keyNo', type: Number, description: 'The key number to generate' })
  @ApiOperation({ summary: 'Get the app key for a card by UID', operationId: 'getAppKeyByUid' })
  @ApiResponse({ status: 200, description: 'The app key for the card' })
  async getAppKeyByUid(@Param('cardUID') cardUID: string, @Param('keyNo', ParseIntPipe) keyNo: number) {
    const key = await this.fabreaderService.generateNTAG424Key({
      keyNo,
      cardUID,
    });

    return {
      key: this.fabreaderService.uint8ArrayToHexString(key),
    };
  }
}
