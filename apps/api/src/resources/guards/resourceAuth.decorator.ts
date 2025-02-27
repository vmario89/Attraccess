import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtGuard } from '../../users-and-auth/strategies/jwt.guard';
import { SystemPermissionsGuard } from '../../users-and-auth/strategies/systemPermissions.guard';
import { ResourcePermissionsGuard } from './resourcePermissions.guard';

export function ResourceAuth() {
  return applyDecorators(
    UseGuards(JwtGuard, SystemPermissionsGuard, ResourcePermissionsGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({
      description: 'Forbidden - Insufficient permissions',
    })
  );
}
