import {
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Patch,
  Body,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DbService } from './modules/persistence/db.service';
import { FabreaderGateway } from './modules/websockets/websocket.gateway';
import { AuthenticatedRequest, Auth } from '@attraccess/plugins-backend-sdk';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { WebsocketService } from './modules/websockets/websocket.service';

@Controller('fabreader/readers')
export class ReaderController {
  private readonly logger = new Logger(ReaderController.name);

  public constructor(
    @Inject(DbService)
    private readonly dbService: DbService,
    @Inject(FabreaderGateway)
    private readonly fabreaderGateway: FabreaderGateway,
    @Inject(WebsocketService)
    private readonly websocketService: WebsocketService
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

  @Post(':readerId/reset-nfc-card/:cardId')
  @Auth()
  @ApiParam({ name: 'readerId', type: Number, description: 'The ID of the reader to reset the NFC card on' })
  @ApiParam({ name: 'cardId', type: Number, description: 'The ID of the NFC card to reset' })
  @ApiOperation({ summary: 'Reset an NFC card', operationId: 'resetNfcCard' })
  @ApiResponse({ status: 200, description: 'Reset initiated, continue on Reader' })
  async resetNfcCard(
    @Param('readerId', ParseIntPipe) readerId: number,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Req() req: AuthenticatedRequest
  ) {
    await this.fabreaderGateway.startResetOfNfcCard({
      readerId,
      cardId,
      userId: req.user.id,
    });

    return {
      message: 'Reset initiated, continue on Reader',
    };
  }

  @Patch(':readerId')
  @Auth('canManageSystemConfiguration')
  @ApiParam({ name: 'readerId', type: Number, description: 'The ID of the reader to update' })
  @ApiOperation({ summary: 'Update reader name and connected resources', operationId: 'updateReader' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The new name for the reader' },
        connectedResources: {
          type: 'array',
          items: { type: 'number' },
          description: 'IDs of resources connected to this reader',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Reader updated successfully' })
  @ApiResponse({ status: 404, description: 'Reader not found' })
  async updateReader(
    @Param('readerId', ParseIntPipe) readerId: number,
    @Body() updateData: { name?: string; connectedResources?: number[] }
  ) {
    this.logger.debug(`Updating reader ${readerId} with data: ${JSON.stringify(updateData)}`);
    try {
      const updatedReader = await this.dbService.updateReader(readerId, updateData);

      return {
        message: 'Reader updated successfully',
        reader: updatedReader,
      };
    } catch (error) {
      if (error.message?.includes('not found')) {
        throw new NotFoundException(`Reader with ID ${readerId} not found`);
      }
      throw error;
    }
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all readers', operationId: 'getReaders' })
  @ApiResponse({ status: 200, description: 'The list of readers' })
  async getReaders() {
    const readers = await this.dbService.getAllReaders();

    return readers.map((reader) => {
      return {
        ...reader,
        connected: Array.from(this.websocketService.sockets.values()).some((socket) => socket.reader?.id === reader.id),
      };
    });
  }
}
