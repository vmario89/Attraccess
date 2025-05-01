import { Controller, Inject, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { DbService } from './modules/persistence/db.service';
import { FabreaderGateway } from './modules/websockets/websocket.gateway';
import { AuthenticatedRequest, Auth } from '@attraccess/plugins';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FabreaderService } from './fabreader.service';

@Controller('fabreader')
export class FabreaderController {
  public constructor(
    @Inject(DbService)
    private readonly dbService: DbService,
    @Inject(FabreaderGateway)
    private readonly fabreaderGateway: FabreaderGateway,
    @Inject(FabreaderService)
    private readonly fabreaderService: FabreaderService
  ) {}

  @Post('readers/:readerId/enroll-nfc-card')
  @Auth()
  @ApiParam({ name: 'readerId', type: Number, description: 'The ID of the reader to enroll the NFC card on' })
  @ApiOperation({ summary: 'Enroll a new NFC card', operationId: 'enrollNfcCard' })
  @ApiResponse({ status: 200, description: 'Enrollment initiated, continue on Reader' })
  async enrollNfcCard(@Param('readerId', ParseIntPipe) readerId: number, @Req() req: AuthenticatedRequest) {
    await this.fabreaderGateway.startEnrollOfNewNfcCard({
      readerId,
      userId: req.user.id,
    });

    return {
      message: 'Enrollment initiated, continue on Reader',
    };
  }

  @Post('cards/:cardUID/keys/:keyNo')
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
