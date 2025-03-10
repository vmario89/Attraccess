import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ResourcesService } from '../resources.service';
import { User } from '@attraccess/database-entities';
import { ResourceNotFoundException } from '../../exceptions/resource.notFound.exception';

@Injectable()
export class CanManageResourcesGuard implements CanActivate {
  private readonly logger = new Logger(CanManageResourcesGuard.name);

  constructor(private resourcesService: ResourcesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const resourceIdParam = request.params.resourceId;

    // We need to convert to number first to avoid passing a string to the service
    const resourceId = parseInt(resourceIdParam, 10);

    if (isNaN(resourceId)) {
      throw new BadRequestException(
        `Resource ID must be a number: ${resourceIdParam}`
      );
    }

    // If no user is present, deny access
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      // Check if the user has system permissions to manage all resources
      if (user.systemPermissions && user.systemPermissions.canManageResources) {
        return true;
      }

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
