import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
  Logger,
  BadRequestException,
  Inject,
  Optional,
} from '@nestjs/common';
import { ResourcesService } from '../resources.service';
import { User } from '@attraccess/database-entities';
import { ResourceNotFoundException } from '../../exceptions/resource.notFound.exception';
import { Reflector } from '@nestjs/core';

// Define the configuration options for the guard
export interface CanManageResourcesOptions {
  paramName?: string; // Name of the parameter to get resource ID from, default: 'resourceId'
  skipResourceCheck?: boolean; // Whether to skip resource ID validation, default: false
}

// Define the metadata key for the guard configuration
export const CAN_MANAGE_RESOURCES_OPTIONS = 'can_manage_resources_options';

@Injectable()
export class CanManageResourcesGuard implements CanActivate {
  private readonly logger = new Logger(CanManageResourcesGuard.name);

  constructor(
    private resourcesService: ResourcesService,
    @Optional() private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    // If no user is present, deny access
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if the user has system permissions to manage all resources
    if (user.systemPermissions && user.systemPermissions.canManageResources) {
      return true;
    }

    // Get the guard options from metadata
    const options: CanManageResourcesOptions =
      this.reflector?.get(CAN_MANAGE_RESOURCES_OPTIONS, context.getHandler()) ||
      {};

    // Default options
    const paramName = options.paramName || 'resourceId';
    const skipResourceCheck = options.skipResourceCheck || false;

    // Skip resource validation if configured
    if (skipResourceCheck) {
      return false; // Still return false as only system admins are allowed without resource context
    }

    const resourceIdParam = request.params[paramName];

    // If no resourceId param, deny access
    if (!resourceIdParam) {
      this.logger.warn(
        `No ${paramName} parameter found in request params: ${JSON.stringify(
          request.params
        )}`
      );
      return false;
    }

    // We need to convert to number first to avoid passing a string to the service
    const resourceId = parseInt(resourceIdParam, 10);

    if (isNaN(resourceId)) {
      throw new BadRequestException(
        `Resource ID must be a number: ${resourceIdParam}`
      );
    }

    try {
      // Check if the resource exists - pass resourceId as a number
      const resource = await this.resourcesService.getResourceById(resourceId);
      if (!resource) {
        throw new ResourceNotFoundException(resourceId);
      }

      // For now, only allow users with system permissions
      // In the future, this could be expanded to include resource-specific permissions

      this.logger.warn(
        `User ${user.id} tried to access resource ${resourceId} without permission`
      );
      return false;
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error checking resource permissions: ${error.message}`,
        error.stack
      );
      return false;
    }
  }
}
