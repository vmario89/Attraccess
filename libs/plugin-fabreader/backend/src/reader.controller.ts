import { Controller, Get, Inject, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { DbService } from './modules/persistence/db.service';
import { FabreaderGateway } from './modules/websockets/websocket.gateway';
import { AuthenticatedRequest, Auth } from '@attraccess/plugins';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FabreaderService } from './fabreader.service';

@Controller('fabreader/readers')
export class ReaderController {
  public constructor(
    @Inject(DbService)
    private readonly dbService: DbService,
    @Inject(FabreaderGateway)
    private readonly fabreaderGateway: FabreaderGateway,
    @Inject(FabreaderService)
    private readonly fabreaderService: FabreaderService
  ) {}

  @Post(':readerId/enroll-nfc-card')
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

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all readers', operationId: 'getReaders' })
  @ApiResponse({ status: 200, description: 'The list of readers' })
  async getReaders() {
    return await this.dbService.getAllReaders();
  }
}
