import { UseGuards, applyDecorators } from '@nestjs/common';
import { CanManageResourcesGuard } from './can-manage-resources.guard';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtGuard } from '../../users-and-auth/strategies/jwt.guard';

/**
 * Decorator to protect routes that require permission to manage resources.
 * Combines the guard with proper API documentation for unauthorized and forbidden responses.
 *
 * Usage: @CanManageResources()
 */
export function CanManageResources() {
  return applyDecorators(
    UseGuards(JwtGuard, CanManageResourcesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'User is not authenticated' }),
    ApiForbiddenResponse({
      description: 'User does not have permission to manage this resource',
    })
  );
}
