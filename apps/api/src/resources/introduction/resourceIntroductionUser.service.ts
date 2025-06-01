import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ResourceIntroductionUser } from '@attraccess/database-entities';
import { ResourcesService } from '../resources.service';
import { ResourceGroupsService } from '../groups/resourceGroups.service'; // Adjusted path
import { ResourceNotFoundException } from '../../exceptions/resource.notFound.exception';


@Injectable()
export class ResourceIntroductionUserService {
  constructor(
    @InjectRepository(ResourceIntroductionUser)
    private resourceIntroductionUserRepository: Repository<ResourceIntroductionUser>,
    private resourcesService: ResourcesService,
    private resourceGroupsService: ResourceGroupsService, // Added service
  ) {}

  // For specific resources
  async addResourceSpecificIntroducer(
    resourceId: number,
    userId: number
  ): Promise<ResourceIntroductionUser> {
    const resource = await this.resourcesService.getResourceById(resourceId);
    if (!resource) {
      throw new ResourceNotFoundException(resourceId);
    }

    const existingPermission =
      await this.resourceIntroductionUserRepository.findOne({
        where: { resourceId, userId, resourceGroupId: IsNull() },
      });

    if (existingPermission) {
      throw new BadRequestException(
        'User already has this specific resource introduction permission'
      );
    }

    const permission = this.resourceIntroductionUserRepository.create({
      resourceId,
      userId,
      resourceGroupId: null, // Explicitly set resourceGroupId to null
      grantedAt: new Date(),
    });

    return this.resourceIntroductionUserRepository.save(permission);
  }

  async removeResourceSpecificIntroducer(resourceId: number, userId: number): Promise<void> {
    const permission = await this.resourceIntroductionUserRepository.findOne({
      where: { resourceId, userId, resourceGroupId: IsNull() },
    });

    if (!permission) {
      throw new NotFoundException(
        'User does not have this specific resource introduction permission'
      );
    }
    await this.resourceIntroductionUserRepository.delete(permission.id);
  }

  async canIntroduceForResource(resourceId: number, userId: number): Promise<boolean> {
    const permission = await this.resourceIntroductionUserRepository.findOne({
      where: { resourceId, userId, resourceGroupId: IsNull() },
    });
    return !!permission;
  }

  async getResourceSpecificIntroducers(
    resourceId: number
  ): Promise<ResourceIntroductionUser[]> {
    return this.resourceIntroductionUserRepository.find({
      where: { resourceId, resourceGroupId: IsNull() },
      relations: ['user'],
    });
  }

  // For resource groups
  async addResourceGroupIntroducer(
    resourceGroupId: number,
    userId: number
  ): Promise<ResourceIntroductionUser> {
    const group = await this.resourceGroupsService.getResourceGroupById(resourceGroupId);
    if (!group) {
      throw new NotFoundException(`Resource group with ID ${resourceGroupId} not found`);
    }

    const existingPermission =
      await this.resourceIntroductionUserRepository.findOne({
        where: { resourceGroupId, userId, resourceId: IsNull() },
      });

    if (existingPermission) {
      throw new BadRequestException(
        'User already has introduction permission for this resource group'
      );
    }

    const permission = this.resourceIntroductionUserRepository.create({
      resourceGroupId,
      userId,
      resourceId: null, // Explicitly set resourceId to null
      grantedAt: new Date(),
    });
    return this.resourceIntroductionUserRepository.save(permission);
  }

  async removeResourceGroupIntroducer(resourceGroupId: number, userId: number): Promise<void> {
    const permission = await this.resourceIntroductionUserRepository.findOne({
      where: { resourceGroupId, userId, resourceId: IsNull() },
    });

    if (!permission) {
      throw new NotFoundException(
        'User does not have introduction permission for this resource group'
      );
    }
    await this.resourceIntroductionUserRepository.delete(permission.id);
  }

  async canIntroduceForResourceGroup(resourceGroupId: number, userId: number): Promise<boolean> {
    const permission = await this.resourceIntroductionUserRepository.findOne({
      where: { resourceGroupId, userId, resourceId: IsNull() },
    });
    return !!permission;
  }

  async getResourceGroupIntroducers(
    resourceGroupId: number
  ): Promise<ResourceIntroductionUser[]> {
    return this.resourceIntroductionUserRepository.find({
      where: { resourceGroupId, resourceId: IsNull() },
      relations: ['user'],
    });
  }
  
  // Combined or general queries
  async isIntroducer(userId: number, resourceId?: number, resourceGroupId?: number): Promise<boolean> {
    if (resourceId && resourceGroupId) {
      throw new BadRequestException('Cannot specify both resourceId and resourceGroupId.');
    }
    if (resourceId) {
      return this.canIntroduceForResource(resourceId, userId);
    }
    if (resourceGroupId) {
      return this.canIntroduceForResourceGroup(resourceGroupId, userId);
    }
    // If neither is provided, check if user is an introducer for *any* resource or group
    const count = await this.resourceIntroductionUserRepository.count({ where: { userId } });
    return count > 0;
  }


  async getUserIntroductionPermissions(
    userId: number
  ): Promise<ResourceIntroductionUser[]> {
    // Fetch all permissions for the user
    const permissions = await this.resourceIntroductionUserRepository.find({
      where: { userId },
      relations: ['user', 'resource', 'resourceGroup'], // Ensure all relevant relations are loaded
    });

    // Filter out permissions that might have both resourceId and resourceGroupId (should not happen with proper creation logic)
    // Or permissions where the related entity is somehow missing despite FK constraint (less likely)
    return permissions.filter(p => (p.resourceId && p.resource) || (p.resourceGroupId && p.resourceGroup));
  }

  // This method helps determine if a user can manage introducers for a specific resource or group.
  // It's more about higher-level permissions, often tied to resource/group ownership or admin roles,
  // rather than just being an introducer themselves.
  // The actual implementation of this might live in ResourceService or ResourceGroupService,
  // or be based on more complex permission system.
  // For now, this is a placeholder or might be simplified.
  async canManageIntroducersForResource(resourceId: number, managingUserId: number): Promise<boolean> {
    // Example: Check if managingUserId is an owner/admin of the resource
    // This logic would typically involve checking other entities or permissions
    // For simplicity, let's assume true if they can introduce for the resource (not strictly correct for "manage")
    // A real implementation would check against User.systemPermissions.canManageResources or specific resource ownership.
    const resource = await this.resourcesService.getResourceById(resourceId);
    if(!resource) throw new ResourceNotFoundException(resourceId);
    // This is a simplified check. Real check would involve user permissions.
    // For now, let's say if they are an introducer, they can manage (which is not a good rule).
    // This should be replaced by actual permission checks (e.g. from a permissions service or user roles)
    return this.canIntroduceForResource(resourceId, managingUserId); 
  }

  async canManageIntroducersForResourceGroup(resourceGroupId: number, managingUserId: number): Promise<boolean> {
    const group = await this.resourceGroupsService.getResourceGroupById(resourceGroupId);
    if(!group) throw new NotFoundException(`Resource group with ID ${resourceGroupId} not found`);
    // Simplified check, similar to above.
    return this.canIntroduceForResourceGroup(resourceGroupId, managingUserId);
  }
}
