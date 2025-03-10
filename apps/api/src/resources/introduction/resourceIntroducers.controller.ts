import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResourceIntroductionService } from './resourceIntroduction.service';
import { ResourceIntroductionUser } from '@attraccess/database-entities';
import {
  Auth,
  SystemPermission,
} from '../../users-and-auth/strategies/systemPermissions.guard';
import { AuthenticatedRequest } from '../../types/request';
import { UsersService } from '../../users-and-auth/users/users.service';
import { CanManageResources } from '../guards/can-manage-resources.decorator';
import { CanManageIntroducersResponseDto } from './dtos/canManageIntroducers.dto';

@ApiTags('Resource Introducers')
@Controller('resources/:resourceId/introducers')
export class ResourceIntroducersController {
  constructor(
    private readonly resourceIntroductionService: ResourceIntroductionService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  @CanManageResources()
  @ApiOperation({ summary: 'Get all authorized introducers for a resource' })
  @ApiResponse({
    status: 200,
    description: 'List of resource introducers',
    type: [ResourceIntroductionUser],
  })
  async getResourceIntroducers(
    @Param('resourceId', ParseIntPipe) resourceId: number
  ): Promise<ResourceIntroductionUser[]> {
    return this.resourceIntroductionService.getResourceIntroducers(resourceId);
  }

  @Post(':userId')
  @CanManageResources()
  @ApiOperation({ summary: 'Add a user as an introducer for a resource' })
  @ApiResponse({
    status: 201,
    description: 'User added as an introducer',
    type: ResourceIntroductionUser,
  })
  async addIntroducer(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<ResourceIntroductionUser> {
    return this.resourceIntroductionService.addIntroducer(resourceId, userId);
  }

  @Delete(':userId')
  @CanManageResources()
  @ApiOperation({ summary: 'Remove a user as an introducer for a resource' })
  @ApiResponse({
    status: 204,
    description: 'User removed as an introducer',
  })
  async removeIntroducer(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<void> {
    return this.resourceIntroductionService.removeIntroducer(
      resourceId,
      userId
    );
  }

  @Get('can-manage')
  @Auth()
  @ApiOperation({
    summary: 'Check if the current user can manage introducers for a resource',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission check result',
    type: CanManageIntroducersResponseDto,
  })
  async canManageIntroducers(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<CanManageIntroducersResponseDto> {
    const user = req.user;

    // User has system-wide resource management permission
    if (user.systemPermissions[SystemPermission.canManageResources]) {
      return { canManageIntroducers: true };
    }

    // Add any specific permission logic here
    const canManage =
      await this.resourceIntroductionService.canManageIntroducers(
        resourceId,
        user.id
      );

    return { canManageIntroducers: canManage };
  }
}
