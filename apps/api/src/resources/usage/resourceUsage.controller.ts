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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResourceUsageService } from './resourceUsage.service';
import { ResourceUsage } from '@attraccess/database-entities';
import { StartUsageSessionDto } from './dtos/startUsageSession.dto';
import { EndUsageSessionDto } from './dtos/endUsageSession.dto';
import { Auth } from '../../users-and-auth/strategies/systemPermissions.guard';
import { AuthenticatedRequest } from '../../types/request';
import { PaginatedResponseDto } from '../../types/response';
import { GetResourceHistoryQueryDto } from './dtos/getResourceHistoryQuery.dto';

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
    type: PaginatedResponseDto,
  })
  async getResourceHistory(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Query() query: GetResourceHistoryQueryDto
  ): Promise<PaginatedResponseDto<ResourceUsage>> {
    if (query.page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (query.limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    const { data, total } =
      await this.resourceUsageService.getResourceUsageHistory(
        resourceId,
        query.page,
        query.limit,
        query.userId
      );

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  @Get('active')
  @Auth()
  @ApiOperation({ summary: 'Get active usage session for current user' })
  @ApiResponse({
    status: 200,
    description: 'Active session retrieved successfully.',
    type: ResourceUsage,
  })
  async getActiveSession(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<ResourceUsage | null> {
    return this.resourceUsageService.getActiveSession(resourceId, req.user.id);
  }
}
