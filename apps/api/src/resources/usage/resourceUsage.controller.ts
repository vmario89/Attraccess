import {
  Controller,
  Post,
  Put,
  Get,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResourceUsageService } from './resourceUsage.service';
import { ResourceUsage } from '@attraccess/database-entities';
import { StartUsageSessionDto } from './dtos/startUsageSession.dto';
import { EndUsageSessionDto } from './dtos/endUsageSession.dto';
import { Auth } from '../../users-and-auth/strategies/systemPermissions.guard';
import { AuthenticatedRequest } from '../../types/request';
import { makePaginatedResponse } from '../../types/response';
import { GetResourceHistoryQueryDto } from './dtos/getResourceHistoryQuery.dto';
import { GetResourceHistoryResponseDto } from './dtos/GetResourceHistoryResponse.dto';

@ApiTags('Resource Usage')
@Controller('resources/:resourceId/usage')
export class ResourceUsageController {
  constructor(private readonly resourceUsageService: ResourceUsageService) {}

  @Post('start')
  @Auth()
  @ApiOperation({ summary: 'Start a resource usage session' })
  @ApiResponse({
    status: 201,
    description: 'Usage session started successfully.',
    type: ResourceUsage,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found',
  })
  async startSession(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Body() dto: StartUsageSessionDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ResourceUsage> {
    return this.resourceUsageService.startSession(resourceId, req.user, dto);
  }

  @Put('end')
  @Auth()
  @ApiOperation({ summary: 'End a resource usage session' })
  @ApiResponse({
    status: 200,
    description: 'Usage session ended successfully.',
    type: ResourceUsage,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or no active session',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Resource or session not found',
  })
  async endSession(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Body() dto: EndUsageSessionDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ResourceUsage> {
    return this.resourceUsageService.endSession(resourceId, req.user, dto);
  }

  @Get('history')
  @Auth()
  @ApiOperation({ summary: 'Get usage history for a resource' })
  @ApiResponse({
    status: 200,
    description: 'Resource usage history retrieved successfully.',
    type: GetResourceHistoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid pagination parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found',
  })
  async getResourceHistory(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Query() query: GetResourceHistoryQueryDto
  ): Promise<GetResourceHistoryResponseDto> {
    const { data, total } =
      await this.resourceUsageService.getResourceUsageHistory(
        resourceId,
        query.page,
        query.limit,
        query.userId
      );

    return makePaginatedResponse(
      { page: query.page, limit: query.limit },
      data,
      total
    );
  }

  @Get('active')
  @Auth()
  @ApiOperation({ summary: 'Get active usage session for current user' })
  @ApiResponse({
    status: 200,
    description: 'Active session retrieved successfully.',
    type: ResourceUsage,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found',
  })
  async getActiveSession(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<ResourceUsage | null> {
    return this.resourceUsageService.getActiveSession(resourceId, req.user.id);
  }
}
