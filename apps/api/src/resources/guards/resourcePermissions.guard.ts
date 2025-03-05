import {
  Injectable,
  ExecutionContext,
  CanActivate,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ResourcesService } from '../resources.service';
import { SystemPermission } from '../../users-and-auth/strategies/systemPermissions.guard';
import { User } from '@attraccess/database-entities';
import { ResourceNotFoundException } from '../../exceptions/resource.notFound.exception';

export enum ResourcePermission {
  canMaintain = 'canMaintain',
  canIntroduce = 'canIntroduce',
}

@Injectable()
export class ResourcePermissionsGuard implements CanActivate {
  private readonly logger = new Logger(ResourcePermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private resourcesService: ResourcesService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    const resourceId = parseInt(request.params.id);

    if (!user) {
      this.logger.warn('No user found in request');
      throw new UnauthorizedException();
    }

    // If user has system-wide resource management permission, allow access
    if (user.systemPermissions[SystemPermission.canManageResources]) {
      return true;
    }

    const resource = await this.resourcesService.getResourceById(resourceId);
    if (!resource) {
      throw new ResourceNotFoundException(resourceId);
    }

    return true;
  }
}
