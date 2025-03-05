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

@ApiTags('Resource Introducers')
@Controller('resources/:resourceId/introducers')
export class ResourceIntroducersController {
  constructor(
    private readonly resourceIntroductionService: ResourceIntroductionService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all authorized introducers for a resource' })
  @ApiResponse({
    status: 200,
    description: 'List of authorized introducers.',
    type: [ResourceIntroductionUser],
  })
  async getResourceIntroducers(
    @Param('resourceId', ParseIntPipe) resourceId: number
  ): Promise<ResourceIntroductionUser[]> {
    return this.resourceIntroductionService.getResourceIntroducers(resourceId);
  }

  @Post('/:userId')
  @Auth(SystemPermission.canManageResources)
  @ApiOperation({ summary: 'Add a user as an authorized introducer' })
  @ApiResponse({
    status: 201,
    description: 'User added as an introducer successfully.',
    type: ResourceIntroductionUser,
  })
  async addIntroducer(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Param('userId', ParseIntPipe) userId: number
  ): Promise<ResourceIntroductionUser> {
    return this.resourceIntroductionService.addIntroducer(resourceId, userId);
  }

  @Delete('/:userId')
  @Auth(SystemPermission.canManageResources)
  @ApiOperation({ summary: 'Remove a user from authorized introducers' })
  @ApiResponse({
    status: 200,
    description: 'User removed from introducers successfully.',
    schema: {
      type: 'object',
      properties: {},
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - User does not have permission to manage resources',
  })
  @ApiResponse({
    status: 404,
    description: 'Resource or user not found',
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

  @Get('permissions/manage')
  @Auth()
  @ApiOperation({
    summary: 'Check if user can manage introducers for the resource',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns whether the user can manage introducers',
    schema: {
      type: 'object',
      properties: {
        canManageIntroducers: { type: 'boolean' },
      },
    },
  })
  async canManageIntroducers(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<{ canManageIntroducers: boolean }> {
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
