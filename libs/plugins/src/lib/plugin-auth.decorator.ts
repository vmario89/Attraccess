import { UseGuards, applyDecorators } from '@nestjs/common';
import { JwtGuard } from '@attraccess/api-utils';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

/**
 * Simple Auth decorator for plugins that doesn't use metadata reflection.
 *
 * This avoids issues where plugins built in separate build pipelines can't
 * access the metadata required by the core Auth decorator.
 *
 * Example usage:
 * ```
 * @Auth()
 * @Get('my-endpoint')
 * myEndpoint() { ... }
 * ```
 */
export function Auth() {
  return applyDecorators(
    UseGuards(JwtGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' })
  );
}
