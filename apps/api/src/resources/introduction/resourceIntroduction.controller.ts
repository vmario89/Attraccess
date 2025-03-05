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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResourceIntroductionService } from './resourceIntroduction.service';
import {
  ResourceIntroduction,
  ResourceIntroductionUser,
  ResourceIntroductionHistoryItem,
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
import {
  RevokeIntroductionDto,
  UnrevokeIntroductionDto,
} from './dtos/revokeIntroduction.dto';
import { UserNotFoundException } from '../../exceptions/user.notFound.exception';
import { MissingIntroductionPermissionException } from '../../exceptions/resource.introduction.forbidden.exception';

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
        throw new UserNotFoundException(dto.userIdentifier);
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found',
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
    summary: 'Check if current user has a valid introduction',
    description:
      'Check if the current user has completed the introduction for this resource and it is not revoked',
  })
  @ApiResponse({
    status: 200,
    description: 'Status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        hasValidIntroduction: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found',
  })
  async checkIntroductionStatus(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<{ hasValidIntroduction: boolean }> {
    const hasValidIntroduction =
      await this.resourceIntroductionService.hasValidIntroduction(
        resourceId,
        req.user.id
      );

    return { hasValidIntroduction };
  }

  @Post(':introductionId/revoke')
  @Auth()
  @ApiOperation({
    summary: 'Revoke an introduction',
    description:
      'Revoke access for a user by marking their introduction as revoked',
  })
  @ApiResponse({
    status: 201,
    description: 'Introduction revoked successfully',
    type: ResourceIntroductionHistoryItem,
  })
  async revokeIntroduction(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Param('introductionId', ParseIntPipe) introductionId: number,
    @Body() dto: RevokeIntroductionDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ResourceIntroductionHistoryItem> {
    // First check if the user can give introductions (same permission check as for completing)
    const canGiveIntroductions =
      await this.resourceIntroductionService.canGiveIntroductions(
        resourceId,
        req.user.id
      );

    const canManageResources = req.user.systemPermissions.canManageResources;

    if (!canGiveIntroductions && !canManageResources) {
      throw new MissingIntroductionPermissionException();
    }

    return this.resourceIntroductionService.revokeIntroduction(
      introductionId,
      req.user.id,
      dto.comment
    );
  }

  @Post(':introductionId/unrevoke')
  @Auth()
  @ApiOperation({
    summary: 'Unrevoke an introduction',
    description: 'Restore access for a user by unrevoking their introduction',
  })
  @ApiResponse({
    status: 201,
    description: 'Introduction unrevoked successfully',
    type: ResourceIntroductionHistoryItem,
  })
  async unrevokeIntroduction(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Param('introductionId', ParseIntPipe) introductionId: number,
    @Body() dto: UnrevokeIntroductionDto,
    @Req() req: AuthenticatedRequest
  ): Promise<ResourceIntroductionHistoryItem> {
    // First check if the user can give introductions (same permission check as for completing)
    const canGiveIntroductions =
      await this.resourceIntroductionService.canGiveIntroductions(
        resourceId,
        req.user.id
      );

    const canManageResources = req.user.systemPermissions.canManageResources;

    if (!canGiveIntroductions && !canManageResources) {
      throw new MissingIntroductionPermissionException();
    }

    return this.resourceIntroductionService.unrevokeIntroduction(
      introductionId,
      req.user.id,
      dto.comment
    );
  }

  @Get(':introductionId/history')
  @Auth()
  @ApiOperation({
    summary: 'Get history of an introduction',
    description:
      'Retrieve the history of revoke/unrevoke actions for an introduction',
  })
  @ApiResponse({
    status: 200,
    description: 'Introduction history retrieved successfully',
    type: [ResourceIntroductionHistoryItem],
  })
  async getIntroductionHistory(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Param('introductionId', ParseIntPipe) introductionId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<ResourceIntroductionHistoryItem[]> {
    // Check permissions
    const canGiveIntroductions =
      await this.resourceIntroductionService.canGiveIntroductions(
        resourceId,
        req.user.id
      );

    const canManageResources = req.user.systemPermissions.canManageResources;

    if (!canGiveIntroductions && !canManageResources) {
      throw new MissingIntroductionPermissionException();
    }

    const history =
      await this.resourceIntroductionService.getIntroductionHistory(
        introductionId
      );

    return history;
  }

  @Get(':introductionId/revoked')
  @Auth()
  @ApiOperation({
    summary: 'Check if an introduction is revoked',
    description: 'Determine if a specific introduction is currently revoked',
  })
  @ApiResponse({
    status: 200,
    description: 'Status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        isRevoked: { type: 'boolean' },
      },
    },
  })
  async checkIntroductionRevokedStatus(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Param('introductionId', ParseIntPipe) introductionId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<{ isRevoked: boolean }> {
    // Check permissions
    const canGiveIntroductions =
      await this.resourceIntroductionService.canGiveIntroductions(
        resourceId,
        req.user.id
      );

    const canManageResources = req.user.systemPermissions.canManageResources;

    if (!canGiveIntroductions && !canManageResources) {
      throw new MissingIntroductionPermissionException();
    }

    const isRevoked =
      await this.resourceIntroductionService.isIntroductionRevoked(
        introductionId
      );

    return { isRevoked };
  }

  @Get(':introductionId')
  @Auth()
  @ApiOperation({
    summary: 'Get a single resource introduction',
    description: 'Retrieve detailed information about a specific introduction',
  })
  @ApiResponse({
    status: 200,
    description: 'Introduction retrieved successfully',
    type: ResourceIntroduction,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User is not authenticated',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - User does not have permission to view this introduction',
  })
  @ApiResponse({
    status: 404,
    description: 'Introduction not found',
  })
  async getResourceIntroduction(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Param('introductionId', ParseIntPipe) introductionId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<ResourceIntroduction> {
    // Check permissions
    const canGiveIntroductions =
      await this.resourceIntroductionService.canGiveIntroductions(
        resourceId,
        req.user.id
      );

    const canManageResources = req.user.systemPermissions.canManageResources;

    if (!canGiveIntroductions && !canManageResources) {
      throw new MissingIntroductionPermissionException();
    }

    return this.resourceIntroductionService.getResourceIntroductionById(
      resourceId,
      introductionId
    );
  }

  @Get('permissions/manage')
  @Auth()
  @ApiOperation({
    summary: 'Check if user can manage introductions for the resource',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns whether the user can manage introductions',
    schema: {
      type: 'object',
      properties: {
        canManageIntroductions: { type: 'boolean' },
      },
    },
  })
  async canManageIntroductions(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Req() req: AuthenticatedRequest
  ): Promise<{ canManageIntroductions: boolean }> {
    const user = req.user;

    // User has system-wide resource management permission
    if (user.systemPermissions[SystemPermission.canManageResources]) {
      return { canManageIntroductions: true };
    }

    // Add any specific permission logic here
    const canManage =
      await this.resourceIntroductionService.canManageIntroductions(
        resourceId,
        user.id
      );

    return { canManageIntroductions: canManage };
  }
}
