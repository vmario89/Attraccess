import { UseGuards, applyDecorators, SetMetadata } from '@nestjs/common';
import {
  CanManageResourcesGuard,
  CanManageResourcesOptions,
  CAN_MANAGE_RESOURCES_OPTIONS,
} from './can-manage-resources.guard';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtGuard } from '@attraccess/api-utils';

/**
 * Decorator to protect routes that require permission to manage resources.
 * Combines the guard with proper API documentation for unauthorized and forbidden responses.
 *
 * Usage:
 * - Default: @CanManageResources()
 * - With options: @CanManageResources({ paramName: 'id', skipResourceCheck: false })
 *
 * @param options Configuration options for the guard
 */
export function CanManageResources(options?: CanManageResourcesOptions) {
  return applyDecorators(
    SetMetadata(CAN_MANAGE_RESOURCES_OPTIONS, options || {}),
    UseGuards(JwtGuard, CanManageResourcesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'User is not authenticated' }),
    ApiForbiddenResponse({
      description: 'User does not have permission to manage this resource',
    })
  );
}
