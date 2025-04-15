import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ping')
  @ApiOperation({ summary: 'Check API availability', operationId: 'ping2' })
  @ApiResponse({
    status: 200,
    description: 'API is available',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'pong' },
      },
    },
  })
  getPing() {
    return this.appService.ping();
  }
}
