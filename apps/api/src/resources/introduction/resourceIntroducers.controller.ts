import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Req,
  ForbiddenException,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResourceIntroductionService } from './resourceIntroduction.service';
import { ResourceIntroductionUser } from '@attraccess/database-entities';
import { Auth } from '../../users-and-auth/strategies/systemPermissions.guard';
import { AuthenticatedRequest } from '../../types/request';
import { UsersService } from '../../users-and-auth/users/users.service';
import { CanManageResources } from '../guards/can-manage-resources.decorator';
import { CanManageIntroducersResponseDto } from './dtos/canManageIntroducers.dto';
import { ResourcesService } from '../resources.service';

@ApiTags('Resource Introducers')
@Controller('resources/:resourceId/introducers')
export class ResourceIntroducersController {
  private readonly logger = new Logger(ResourceIntroducersController.name);

  constructor(
    private readonly resourceIntroductionService: ResourceIntroductionService,
    private readonly usersService: UsersService,
    private readonly resourcesService: ResourcesService
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all authorized introducers for a resource' })
  @ApiResponse({
    status: 200,
    description: 'List of resource introducers',
    type: [ResourceIntroductionUser],
  })
  async getResourceIntroducers(
    @Param('resourceId', ParseIntPipe) resourceId: number
  ): Promise<ResourceIntroductionUser[]> {
    try {
      // First verify the resource exists
      const resource = await this.resourcesService.getResourceById(resourceId);

      if (!resource) {
        throw new NotFoundException(`Resource with ID ${resourceId} not found`);
      }

      // For viewing introducers, any authenticated user is allowed
      // No additional permission checks needed for viewing

      // Get the introducers list
      return this.resourceIntroductionService.getResourceIntroducers(
        resourceId
      );
    } catch (error) {
      this.logger.error(
        `Error getting resource introducers: ${error.message}`,
        error.stack
      );

      // Rethrow known exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      // For other errors, hide details in production
      throw new InternalServerErrorException(
        'Error fetching resource introducers'
      );
    }
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
    if (user.systemPermissions.canManageResources) {
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
