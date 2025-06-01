import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In, Not } from 'typeorm';
import {
  ResourceIntroduction,
  ResourceIntroductionHistoryItem,
  IntroductionHistoryAction,
} from '@attraccess/database-entities';
import { ResourcesService } from '../resources.service';
import { ResourceGroupsService } from '../groups/resourceGroups.service';
import { ResourceIntroductionUserService } from './resourceIntroductionUser.service';
import { UsersService } from '../../users-and-auth/users/users.service';
import { ResourceNotFoundException } from '../../exceptions/resource.notFound.exception';

import { ResourceIntroductionNotFoundException } from '../../exceptions/resource.introduction.notFound.exception';

// Custom Exceptions
class IntroductionAlreadyCompletedException extends BadRequestException {
  constructor(message = 'Introduction already completed for this entity (resource or group).') {
    super(message);
  }
}

class MissingPermissionToGiveIntroductionException extends ForbiddenException {
  constructor() {
    super(
      'User does not have permission to give introductions for this resource/group.'
    );
  }
}

@Injectable()
export class ResourceIntroductionService {
  private readonly logger = new Logger(ResourceIntroductionService.name);

  constructor(
    @InjectRepository(ResourceIntroduction)
    private resourceIntroductionRepository: Repository<ResourceIntroduction>,
    @InjectRepository(ResourceIntroductionHistoryItem)
    private resourceIntroductionHistoryRepository: Repository<ResourceIntroductionHistoryItem>,
    private resourcesService: ResourcesService,
    private resourceGroupsService: ResourceGroupsService,
    private resourceIntroductionUserService: ResourceIntroductionUserService, // Injected
    private usersService: UsersService,
  ) {}

  // --- Resource-Specific Introductions --- 
  async createResourceSpecificIntroduction(
    resourceId: number,
    tutorUserId: number,
    receiverUserId: number
  ): Promise<ResourceIntroduction> {
    const resource = await this.resourcesService.getResourceById(resourceId);
    if (!resource) {
      throw new ResourceNotFoundException(resourceId);
    }

    const canGive = await this.canGiveIntroductionForResource(resourceId, tutorUserId);
    if (!canGive) {
      throw new MissingPermissionToGiveIntroductionException();
    }

    const existingIntroduction = await this.resourceIntroductionRepository.findOne({
      where: { resourceId, receiverUserId, resourceGroupId: IsNull() },
    });

    if (existingIntroduction) {
      throw new IntroductionAlreadyCompletedException();
    }

    const introduction = this.resourceIntroductionRepository.create({
      resourceId,
      receiverUserId,
      tutorUserId,
      resourceGroupId: null, // Explicitly null
    });
    return this.resourceIntroductionRepository.save(introduction);
  }

  async getResourceSpecificIntroductions(
    resourceId: number,
    page = 1,
    limit = 10
  ): Promise<{ data: ResourceIntroduction[]; total: number }> {
    const [data, total] = await this.resourceIntroductionRepository.findAndCount({
      where: { resourceId, resourceGroupId: IsNull() },
      relations: ['receiverUser', 'tutorUser'],
      skip: (page - 1) * limit,
      take: limit,
      order: { completedAt: 'DESC' },
    });
    return { data, total };
  }
  
  async getResourceSpecificIntroductionById(
    introductionId: number,
  ): Promise<ResourceIntroduction> {
    const introduction = await this.resourceIntroductionRepository.findOne({
      where: { id: introductionId, resourceGroupId: IsNull(), resourceId: Not(IsNull()) },
      relations: ['receiverUser', 'tutorUser', 'resource'],
    });
    if (!introduction) {
      throw new ResourceIntroductionNotFoundException(introductionId);
    }
    return introduction;
  }

  // --- Resource Group-Specific Introductions --- 
  async createResourceGroupIntroduction(
    resourceGroupId: number,
    tutorUserId: number,
    receiverUserId: number
  ): Promise<ResourceIntroduction> {
    const group = await this.resourceGroupsService.getResourceGroupById(resourceGroupId);
    if (!group) {
      throw new NotFoundException(`Resource group with ID ${resourceGroupId} not found`);
    }

    const canGive = await this.canGiveIntroductionForResourceGroup(resourceGroupId, tutorUserId);
    if (!canGive) {
      throw new MissingPermissionToGiveIntroductionException();
    }

    const existingIntroduction = await this.resourceIntroductionRepository.findOne({
      where: { resourceGroupId, receiverUserId, resourceId: IsNull() },
    });

    if (existingIntroduction) {
      throw new IntroductionAlreadyCompletedException();
    }

    const introduction = this.resourceIntroductionRepository.create({
      resourceGroupId,
      receiverUserId,
      tutorUserId,
      resourceId: null, // Explicitly null
    });
    return this.resourceIntroductionRepository.save(introduction);
  }

  async getResourceGroupIntroductions(
    resourceGroupId: number,
    page = 1,
    limit = 10
  ): Promise<{ data: ResourceIntroduction[]; total: number }> {
    const [data, total] = await this.resourceIntroductionRepository.findAndCount({
      where: { resourceGroupId, resourceId: IsNull() },
      relations: ['receiverUser', 'tutorUser'],
      skip: (page - 1) * limit,
      take: limit,
      order: { completedAt: 'DESC' },
    });
    return { data, total };
  }

  async getResourceGroupSpecificIntroductionById(
    introductionId: number,
  ): Promise<ResourceIntroduction> {
    const introduction = await this.resourceIntroductionRepository.findOne({
      where: { id: introductionId, resourceId: IsNull(), resourceGroupId: Not(IsNull()) },
      relations: ['receiverUser', 'tutorUser', 'resourceGroup'],
    });
    if (!introduction) {
      throw new ResourceIntroductionNotFoundException(introductionId);
    }
    return introduction;
  }

  // --- Generic Methods (Handling Both Resource and Group) ---

  async getIntroductionById(introductionId: number): Promise<ResourceIntroduction> {
     const introduction = await this.resourceIntroductionRepository.findOne({
      where: { id: introductionId },
      relations: ['receiverUser', 'tutorUser', 'resource', 'resourceGroup'],
    });
    if (!introduction) {
      throw new ResourceIntroductionNotFoundException(introductionId);
    }
    return introduction;
  }

  async getUserIntroductions(userId: number): Promise<ResourceIntroduction[]> {
    return this.resourceIntroductionRepository.find({
      where: { receiverUserId: userId },
      relations: ['resource', 'resourceGroup', 'tutorUser', 'receiverUser'],
    });
  }

  // --- Permission Checks --- 
  async canGiveIntroductionForResource(resourceId: number, tutorUserId: number): Promise<boolean> {
    const isIntroducer = await this.resourceIntroductionUserService.isIntroducer(tutorUserId, resourceId);
    const user = await this.usersService.findOne({ id: tutorUserId });
    const canManageSystem = user?.systemPermissions?.canManageResources || false;
    return isIntroducer || canManageSystem;
  }

  async canGiveIntroductionForResourceGroup(resourceGroupId: number, tutorUserId: number): Promise<boolean> {
    const isIntroducer = await this.resourceIntroductionUserService.isIntroducer(tutorUserId, undefined, resourceGroupId);
    const user = await this.usersService.findOne({ id: tutorUserId });
    // Assuming canManageResources implies ability to manage group intros too, or a new permission is needed
    const canManageSystem = user?.systemPermissions?.canManageResources || false; 
    return isIntroducer || canManageSystem;
  }

  // --- Revocation Logic (operates on introductionId, largely unchanged) ---
  async isIntroductionRevoked(introductionId: number): Promise<boolean> {
    const latestHistory = await this.resourceIntroductionHistoryRepository.findOne({
      where: { introductionId },
      order: { createdAt: 'DESC' },
    });
    return latestHistory?.action === IntroductionHistoryAction.REVOKE;
  }

  async getIntroductionHistory(introductionId: number): Promise<ResourceIntroductionHistoryItem[]> {
    const introduction = await this.resourceIntroductionRepository.count({ where: { id: introductionId } });
    if (!introduction) throw new ResourceIntroductionNotFoundException(introductionId);

    return this.resourceIntroductionHistoryRepository.find({
      where: { introductionId },
      relations: ['performedByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async revokeIntroduction(
    introductionId: number,
    performedByUserId: number,
    comment?: string
  ): Promise<ResourceIntroductionHistoryItem> {
    const introToRevoke = await this.getIntroductionById(introductionId); // Ensures it exists

    // Permission check: User performing action must be able to give introductions for the specific resource/group OR be a system admin
    let canRevoke = false;
    if (introToRevoke.resourceId) {
      canRevoke = await this.canGiveIntroductionForResource(introToRevoke.resourceId, performedByUserId);
    } else if (introToRevoke.resourceGroupId) {
      canRevoke = await this.canGiveIntroductionForResourceGroup(introToRevoke.resourceGroupId, performedByUserId);
    }
    const performingUser = await this.usersService.findOne({ id: performedByUserId });
    if (!canRevoke && !performingUser?.systemPermissions?.canManageResources) {
        throw new ForbiddenException('User does not have permission to revoke this introduction.');
    }

    if (await this.isIntroductionRevoked(introductionId)) {
      throw new BadRequestException('This introduction is already revoked.');
    }

    const historyEntry = this.resourceIntroductionHistoryRepository.create({
      introductionId,
      action: IntroductionHistoryAction.REVOKE,
      performedByUserId,
      comment: comment || null,
    });
    return this.resourceIntroductionHistoryRepository.save(historyEntry);
  }

  async unrevokeIntroduction(
    introductionId: number,
    performedByUserId: number,
    comment?: string
  ): Promise<ResourceIntroductionHistoryItem> {
    const introToUnrevoke = await this.getIntroductionById(introductionId); // Ensures it exists

    // Permission check (similar to revoke)
    let canUnrevoke = false;
    if (introToUnrevoke.resourceId) {
      canUnrevoke = await this.canGiveIntroductionForResource(introToUnrevoke.resourceId, performedByUserId);
    } else if (introToUnrevoke.resourceGroupId) {
      canUnrevoke = await this.canGiveIntroductionForResourceGroup(introToUnrevoke.resourceGroupId, performedByUserId);
    }
     const performingUser = await this.usersService.findOne({ id: performedByUserId });
    if (!canUnrevoke && !performingUser?.systemPermissions?.canManageResources) {
        throw new ForbiddenException('User does not have permission to unrevoke this introduction.');
    }

    if (!(await this.isIntroductionRevoked(introductionId))) {
      throw new BadRequestException('This introduction is not currently revoked.');
    }

    const historyEntry = this.resourceIntroductionHistoryRepository.create({
      introductionId,
      action: IntroductionHistoryAction.UNREVOKE,
      performedByUserId,
      comment: comment || null,
    });
    return this.resourceIntroductionHistoryRepository.save(historyEntry);
  }

  // --- hasValidIntroduction (Complex Logic) ---
  async hasValidIntroduction(
    resourceToCheckId: number,
    userId: number
  ): Promise<boolean> {
    // 1. Check for direct, non-revoked resource-specific introduction
    const directIntro = await this.resourceIntroductionRepository.findOne({
      where: {
        receiverUserId: userId,
        resourceId: resourceToCheckId,
        resourceGroupId: IsNull(),
      },
    });

    if (directIntro && !(await this.isIntroductionRevoked(directIntro.id))) {
      return true;
    }

    // 2. Check for group-based introductions
    const resource = await this.resourcesService.getResourceById(resourceToCheckId);
    if (!resource) {
      throw new ResourceNotFoundException(resourceToCheckId);
    }

    if (resource.groups && resource.groups.length > 0) {
      const groupIds = resource.groups.map((g) => g.id);
      const groupIntros = await this.resourceIntroductionRepository.find({
        where: {
          receiverUserId: userId,
          resourceGroupId: In(groupIds),
          resourceId: IsNull(),
        },
      });

      for (const groupIntro of groupIntros) {
        if (!(await this.isIntroductionRevoked(groupIntro.id))) {
          return true; // Found a valid group introduction
        }
      }
    }
    return false;
  }

  // Methods like `canManageIntroductions` and `canManageIntroducers` from the original file
  // are removed as their logic is either too simplistic, duplicated, or better handled by
  // `ResourceIntroductionUserService` or direct permission checks in controllers.
  // The `ResourceIntroducersController` specifically used `canManageIntroducers`.
  // That controller should now rely on system permissions (e.g. `CanManageResources` guard)
  // or a more robust permission check, possibly from `ResourceIntroductionUserService` if refined.
}
