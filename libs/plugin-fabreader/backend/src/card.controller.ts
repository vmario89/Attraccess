import { Controller, Get, Inject, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { DbService } from './modules/persistence/db.service';
import { FabreaderGateway } from './modules/websockets/websocket.gateway';
import { Auth, AuthenticatedRequest } from '@attraccess/plugins-backend-sdk';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FabreaderService } from './fabreader.service';

@Controller('fabreader/cards')
export class CardController {
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

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all cards (to which you have access)' })
  @ApiResponse({ status: 200, description: 'The list of all cards' })
  async getCards(@Req() req: AuthenticatedRequest) {
    if (req.user.systemPermissions.canManageSystemConfiguration) {
      return await this.dbService.getAllNFCCards();
    }

    return this.dbService.getNFCCardsByUserId(req.user.id);
  }
}
