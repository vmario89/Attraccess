import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ResourceGroupsService } from '../resourceGroups.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResourceGroup, ResourceIntroducer } from '@attraccess/database-entities';
import { ResourceGroupsIntroducersService } from './resourceGroups.introducers.service';
import { Auth } from '@attraccess/plugins-backend-sdk';

@ApiTags('Access Control')
@Controller('resource-groups/:groupId/introducers')
export class ResourceGroupsIntroducersController {
  constructor(
    private readonly resourceGroupsService: ResourceGroupsService,
    private readonly resourceGroupsIntroducersService: ResourceGroupsIntroducersService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all introducers for a resource group', operationId: 'resourceGroupIntroducersGetMany' })
  @ApiParam({ name: 'groupId', description: 'The ID of the resource group', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The introducers have been successfully retrieved.',
    type: [ResourceIntroducer],
  })
  @ApiResponse({
    status: 404,
    description: 'The resource group has not been found.',
  })
  async getMany(@Param('groupId', ParseIntPipe) groupId: number): Promise<ResourceIntroducer[]> {
    const group = await this.resourceGroupsService.getOne({ id: groupId }, ['introducers']);

    return group.introducers;
  }

  @Post('/:userId/grant')
  @Auth('canManageResources')
  @ApiOperation({
    summary: 'Grant a user introduction permission for a resource group',
    operationId: 'resourceGroupIntroducersGrant',
  })
  @ApiParam({ name: 'userId', description: 'The ID of the user', type: Number })
  @ApiParam({ name: 'groupId', description: 'The ID of the resource group', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The introducer has been successfully granted.',
  })
  async grant(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<ResourceIntroducer> {
    return this.resourceGroupsIntroducersService.grant(groupId, userId);
  }

  @Post('/:userId/revoke')
  @Auth('canManageResources')
  @ApiOperation({
    summary: 'Revoke a user introduction permission for a resource group',
    operationId: 'resourceGroupIntroducersRevoke',
  })
  @ApiParam({ name: 'userId', description: 'The ID of the user', type: Number })
  @ApiParam({ name: 'groupId', description: 'The ID of the resource group', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The introducer has been successfully revoked.',
  })
  async revoke(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('groupId', ParseIntPipe) groupId: number
  ): Promise<ResourceIntroducer> {
    return this.resourceGroupsIntroducersService.revoke(groupId, userId);
  }
}
