import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Req,
  Body,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResourceIntroductionService } from './resourceIntroduction.service';
import {
  ResourceIntroduction,
  ResourceIntroductionUser,
} from '@attraccess/database-entities';
import {
  Auth,
  SystemPermission,
} from '../../users-and-auth/strategies/systemPermissions.guard';
import { AuthenticatedRequest } from '../../types/request';
import { PaginatedResponseDto } from '../../types/response';
import { GetResourceIntroductionsQueryDto } from './dtos/getResourceIntroductionsQuery.dto';
import { PaginatedResourceIntroductionResponseDto } from './dtos/paginatedResourceIntroductionResponse.dto';
import { UsersService } from '../../users-and-auth/users/users.service';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class CompleteIntroductionDto {
  @ApiProperty({
    description: 'User ID (deprecated, use userIdentifier instead)',
    required: false,
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  userId?: number;

  @ApiProperty({
    description: 'Username or email of the user',
    required: false,
    example: 'username or user@example.com',
  })
  @IsString()
  @IsOptional()
  userIdentifier?: string;
}

@ApiTags('Resource Introductions')
@Controller('resources/:resourceId/introductions')
export class ResourceIntroductionController {
  constructor(
    private readonly resourceIntroductionService: ResourceIntroductionService,
    private readonly usersService: UsersService
  ) {}

  @Post('complete')
  @Auth()
  @ApiOperation({
    summary: 'Mark resource introduction as completed for a user',
    description:
      'Complete an introduction for a user identified by their user ID, username, or email.',
  })
  @ApiResponse({
    status: 201,
    description: 'Introduction marked as completed successfully.',
    type: ResourceIntroduction,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Neither userId nor userIdentifier provided',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found with the provided identifier',
  })
  async completeIntroduction(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Body() dto: CompleteIntroductionDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ResourceIntroduction> {
    // Determine the target user ID from either userId or userIdentifier
    let targetUserId: number;

    if (dto.userId) {
      // Use directly provided userId if available
      targetUserId = dto.userId;
    } else if (dto.userIdentifier) {
      // Try to find user by username or email
      const isEmail = dto.userIdentifier.includes('@');
      const user = await this.usersService.findOne(
        isEmail
          ? { email: dto.userIdentifier }
          : { username: dto.userIdentifier }
      );

      if (!user) {
        throw new NotFoundException(
          `User with ${isEmail ? 'email' : 'username'} "${
            dto.userIdentifier
          }" not found`
        );
      }

      targetUserId = user.id;
    } else {
      throw new BadRequestException(
        'Either userId or userIdentifier must be provided'
      );
    }

    return this.resourceIntroductionService.createIntroduction(
      resourceId,
      req.user.id,
      targetUserId
    );
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all introductions for a resource' })
  @ApiResponse({
    status: 200,
    description: 'List of resource introductions.',
    type: PaginatedResourceIntroductionResponseDto,
  })
  async getResourceIntroductions(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Query() query: GetResourceIntroductionsQueryDto
  ): Promise<PaginatedResponseDto<ResourceIntroduction>> {
    const { data, total } =
      await this.resourceIntroductionService.getResourceIntroductions(
        resourceId,
        query.page,
        query.limit
      );

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  @Get('status')
  @Auth()
  @ApiOperation({
    summary: 'Check if current user has completed the introduction',
  })
  @ApiResponse({
    status: 200,
    description: 'Introduction completion status.',
    type: Boolean,
  })
  async checkIntroductionStatus(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<boolean> {
    return this.resourceIntroductionService.hasCompletedIntroduction(
      resourceId,
      req.user.id
    );
  }

  @Post('introducers/:userId')
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

  @Delete('introducers/:userId')
  @Auth(SystemPermission.canManageResources)
  @ApiOperation({ summary: 'Remove a user from authorized introducers' })
  @ApiResponse({
    status: 200,
    description: 'User removed from introducers successfully.',
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

  @Get('introducers')
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
}
