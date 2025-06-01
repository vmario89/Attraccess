import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  Req,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  ResourceIntroductionUser,
  ResourceIntroduction,
  ResourceIntroductionHistoryItem,
} from '@attraccess/database-entities';
import { Auth, AuthenticatedRequest } from '@attraccess/plugins-backend-sdk';
import { CanManageResources } from '../../guards/can-manage-resources.decorator';
import { ResourceIntroductionService } from '../../introduction/resourceIntroduction.service';
import { ResourceIntroductionUserService } from '../../introduction/resourceIntroductionUser.service';
import { AddResourceGroupIntroducerDto } from '../dto/add-resource-group-introducer.dto';
import { CreateResourceGroupIntroductionDto } from '../dto/create-resource-group-introduction.dto';
import { GetResourceIntroductionsQueryDto } from '../../introduction/dtos/getResourceIntroductionsQuery.dto';
import { PaginatedResourceIntroductionResponseDto } from '../../introduction/dtos/paginatedResourceIntroductionResponse.dto';
import { RevokeIntroductionDto, UnrevokeIntroductionDto } from '../../introduction/dtos/revokeIntroduction.dto';
import { PaginatedResponse, makePaginatedResponse } from '../../../types/response';

@ApiTags('Resource Group Introductions & Introducers')
@Controller('resource-groups/:groupId')
@Auth()
export class ResourceGroupIntroductionsController {
  constructor(
    private readonly resourceIntroductionService: ResourceIntroductionService,
    private readonly resourceIntroductionUserService: ResourceIntroductionUserService,
  ) {}

  // --- Group Introducers ---

  @Post('introducers')
  @CanManageResources() // Or a more specific group management guard
  @ApiOperation({ summary: 'Add a user as an introducer for a resource group', operationId: 'addResourceGroupIntroducer' })
  @ApiResponse({ status: 201, description: 'User added as a group introducer', type: ResourceIntroductionUser })
  @ApiParam({ name: 'groupId', description: 'ID of the resource group' })
  async addGroupIntroducer(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: AddResourceGroupIntroducerDto,
  ): Promise<ResourceIntroductionUser> {
    return this.resourceIntroductionUserService.addResourceGroupIntroducer(groupId, dto.userId);
  }

  @Get('introducers')
  @ApiOperation({ summary: 'Get all introducers for a resource group', operationId: 'getResourceGroupIntroducers' })
  @ApiResponse({ status: 200, description: 'List of group introducers', type: [ResourceIntroductionUser] })
  @ApiParam({ name: 'groupId', description: 'ID of the resource group' })
  async getGroupIntroducers(
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<ResourceIntroductionUser[]> {
    return this.resourceIntroductionUserService.getResourceGroupIntroducers(groupId);
  }

  @Delete('introducers/:userId')
  @CanManageResources() // Or a more specific group management guard
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a user as an introducer for a resource group', operationId: 'removeResourceGroupIntroducer' })
  @ApiResponse({ status: 204, description: 'User removed as a group introducer' })
  @ApiParam({ name: 'groupId', description: 'ID of the resource group' })
  @ApiParam({ name: 'userId', description: 'ID of the user to remove as introducer' })
  async removeGroupIntroducer(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    await this.resourceIntroductionUserService.removeResourceGroupIntroducer(groupId, userId);
  }

  // --- Group Introductions ---

  @Post('introductions')
  @ApiOperation({ summary: 'Grant a group introduction to a user', operationId: 'createResourceGroupIntroduction' })
  @ApiResponse({ status: 201, description: 'Group introduction granted', type: ResourceIntroduction })
  @ApiParam({ name: 'groupId', description: 'ID of the resource group' })
  async createGroupIntroduction(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreateResourceGroupIntroductionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResourceIntroduction> {
    const tutorUserId = dto.tutorUserId ?? req.user.id;
    return this.resourceIntroductionService.createResourceGroupIntroduction(
      groupId,
      tutorUserId,
      dto.receiverUserId,
    );
  }

  @Get('introductions')
  @CanManageResources() // Assuming only managers can see all introductions for a group
  @ApiOperation({ summary: 'Get all introductions for a resource group', operationId: 'getResourceGroupIntroductions' })
  @ApiResponse({ status: 200, description: 'List of group introductions', type: PaginatedResourceIntroductionResponseDto })
  @ApiParam({ name: 'groupId', description: 'ID of the resource group' })
  async getGroupIntroductions(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() query: GetResourceIntroductionsQueryDto,
  ): Promise<PaginatedResponse<ResourceIntroduction>> {
    const { data, total } = await this.resourceIntroductionService.getResourceGroupIntroductions(
      groupId,
      query.page,
      query.limit,
    );
    return makePaginatedResponse({ page: query.page, limit: query.limit }, data, total);
  }
  
  @Get('introductions/:introductionId')
  @CanManageResources() // Or specific permission to view introduction details
  @ApiOperation({ summary: 'Get a specific group introduction by its ID', operationId: 'getResourceGroupIntroductionById' })
  @ApiResponse({ status: 200, description: 'Group introduction details', type: ResourceIntroduction })
  @ApiParam({ name: 'groupId', description: 'ID of the resource group (context)' })
  @ApiParam({ name: 'introductionId', description: 'ID of the introduction' })
  async getGroupIntroductionById(
    @Param('groupId', ParseIntPipe) groupId: number, // Context, though service uses introductionId primarily
    @Param('introductionId', ParseIntPipe) introductionId: number,
  ): Promise<ResourceIntroduction> {
    // The service method getResourceGroupSpecificIntroductionById only needs introductionId
    // groupId is here for route structure consistency and context.
    return this.resourceIntroductionService.getResourceGroupSpecificIntroductionById(introductionId);
  }

  @Post('introductions/:introductionId/revoke')
  @ApiOperation({ summary: 'Revoke a group introduction', operationId: 'revokeResourceGroupIntroduction' })
  @ApiResponse({ status: 201, description: 'Group introduction revoked', type: ResourceIntroductionHistoryItem })
  @ApiParam({ name: 'groupId', description: 'ID of the resource group (context)' })
  @ApiParam({ name: 'introductionId', description: 'ID of the introduction to revoke' })
  async revokeGroupIntroduction(
    @Param('groupId', ParseIntPipe) groupId: number, // Context
    @Param('introductionId', ParseIntPipe) introductionId: number,
    @Body() dto: RevokeIntroductionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResourceIntroductionHistoryItem> {
    return this.resourceIntroductionService.revokeIntroduction(introductionId, req.user.id, dto.comment);
  }

  @Post('introductions/:introductionId/unrevoke')
  @ApiOperation({ summary: 'Unrevoke a group introduction', operationId: 'unrevokeResourceGroupIntroduction' })
  @ApiResponse({ status: 201, description: 'Group introduction unrevoked', type: ResourceIntroductionHistoryItem })
  @ApiParam({ name: 'groupId', description: 'ID of the resource group (context)' })
  @ApiParam({ name: 'introductionId', description: 'ID of the introduction to unrevoke' })
  async unrevokeGroupIntroduction(
    @Param('groupId', ParseIntPipe) groupId: number, // Context
    @Param('introductionId', ParseIntPipe) introductionId: number,
    @Body() dto: UnrevokeIntroductionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResourceIntroductionHistoryItem> {
    return this.resourceIntroductionService.unrevokeIntroduction(introductionId, req.user.id, dto.comment);
  }

  @Get('introductions/:introductionId/history')
  @CanManageResources() // Or specific permission
  @ApiOperation({ summary: 'Get history for a group introduction', operationId: 'getResourceGroupIntroductionHistory' })
  @ApiResponse({ status: 200, description: 'Introduction history', type: [ResourceIntroductionHistoryItem] })
  @ApiParam({ name: 'groupId', description: 'ID of the resource group (context)' })
  @ApiParam({ name: 'introductionId', description: 'ID of the introduction' })
  async getGroupIntroductionHistory(
    @Param('groupId', ParseIntPipe) groupId: number, // Context
    @Param('introductionId', ParseIntPipe) introductionId: number,
  ): Promise<ResourceIntroductionHistoryItem[]> {
    return this.resourceIntroductionService.getIntroductionHistory(introductionId);
  }
}
