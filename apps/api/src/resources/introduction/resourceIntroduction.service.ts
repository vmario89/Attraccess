import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ResourceIntroduction,
  ResourceIntroductionUser,
  ResourceIntroductionHistoryItem,
  IntroductionHistoryAction,
} from '@attraccess/database-entities';
import { ResourcesService } from '../resources.service';
import { ResourceNotFoundException } from '../../exceptions/resource.notFound.exception';
import { ResourceIntroductionNotFoundException } from '../../exceptions/resource.introduction.notFound.exception';
import { MissingIntroductionPermissionException } from '../../exceptions/resource.introduction.forbidden.exception';
import { UsersService } from '../../users-and-auth/users/users.service';

class IntroducionAlreadyCompletedException extends BadRequestException {
  constructor() {
    super('IntroducionAlreadyCompletedError');
  }
}

class MissingResourceIntroductionPermissionException extends ForbiddenException {
  constructor() {
    super('MissingResourceIntroductionPermissionException');
  }
}

class UserAlreadyHasIntroductionPermissionException extends ForbiddenException {
  constructor() {
    super('UserAlreadyHasIntroductionPermissionException');
  }
}

@Injectable()
export class ResourceIntroductionService {
  private readonly logger = new Logger(ResourceIntroductionService.name);

  constructor(
    @InjectRepository(ResourceIntroduction)
    private resourceIntroductionRepository: Repository<ResourceIntroduction>,
    @InjectRepository(ResourceIntroductionUser)
    private resourceIntroductionUserRepository: Repository<ResourceIntroductionUser>,
    @InjectRepository(ResourceIntroductionHistoryItem)
    private resourceIntroductionHistoryRepository: Repository<ResourceIntroductionHistoryItem>,
    private resourcesService: ResourcesService,
    private usersService: UsersService
  ) {}

  async createIntroduction(
    resourceId: number,
    tutorUserId: number,
    introductionReceiverUserId: number
  ): Promise<ResourceIntroduction> {
    // Check if resource exists
    const resource = await this.resourcesService.getResourceById(resourceId);
    if (!resource) {
      throw new ResourceNotFoundException(resourceId);
    }

    // Check if the completing user has permission to give introductions
    const hasPermission = await this.canGiveIntroductions(
      resourceId,
      tutorUserId
    );
    if (!hasPermission) {
      throw new MissingResourceIntroductionPermissionException();
    }

    // Check if introduction already completed
    const existingIntroduction =
      await this.resourceIntroductionRepository.findOne({
        where: {
          resourceId,
          receiverUserId: introductionReceiverUserId,
        },
      });

    if (existingIntroduction) {
      throw new IntroducionAlreadyCompletedException();
    }

    // Create or update introduction record
    const introduction = this.resourceIntroductionRepository.create({
      resourceId,
      receiverUserId: introductionReceiverUserId,
      tutorUserId: tutorUserId,
    });

    return this.resourceIntroductionRepository.save(introduction);
  }

  async removeIntroduction(
    resourceId: number,
    introductionReceiverUserId: number
  ) {
    await this.resourceIntroductionRepository.delete({
      resourceId,
      receiverUserId: introductionReceiverUserId,
    });
  }

  async hasCompletedIntroduction(
    resourceId: number,
    introductionReceiverUserId: number
  ): Promise<boolean> {
    const introduction = await this.resourceIntroductionRepository.findOne({
      where: {
        resourceId,
        receiverUserId: introductionReceiverUserId,
      },
    });

    return !!introduction?.completedAt;
  }

  async canGiveIntroductions(
    resourceId: number,
    tutorUserId: number
  ): Promise<boolean> {
    const permission = await this.resourceIntroductionUserRepository.findOne({
      where: {
        resourceId,
        userId: tutorUserId,
      },
    });

    const hasPermission = !!permission;

    const user = await this.usersService.findOne({ id: tutorUserId });
    const canManageResources = user.systemPermissions.canManageResources;

    return hasPermission || canManageResources;
  }

  async getResourceIntroductions(
    resourceId: number,
    page = 1,
    limit = 10
  ): Promise<{ data: ResourceIntroduction[]; total: number }> {
    const [introductions, total] =
      await this.resourceIntroductionRepository.findAndCount({
        where: { resourceId },
        relations: ['receiverUser', 'tutorUser'],
        skip: (page - 1) * limit,
        take: limit,
        order: {
          completedAt: 'DESC', // Sort by most recently completed
        },
      });

    return {
      data: introductions,
      total,
    };
  }

  async getUserIntroductions(userId: number): Promise<ResourceIntroduction[]> {
    return this.resourceIntroductionRepository.find({
      where: { receiverUserId: userId },
      relations: ['resource', 'tutorUser'],
    });
  }

  async addIntroducer(
    resourceId: number,
    userId: number
  ): Promise<ResourceIntroductionUser> {
    // Check if resource exists
    const resource = await this.resourcesService.getResourceById(resourceId);
    if (!resource) {
      throw new ResourceNotFoundException(resourceId);
    }

    // Check if user already has permission
    const existingPermission =
      await this.resourceIntroductionUserRepository.findOne({
        where: {
          resourceId,
          userId,
        },
      });

    if (existingPermission) {
      throw new UserAlreadyHasIntroductionPermissionException();
    }

    // Create new permission
    const permission = this.resourceIntroductionUserRepository.create({
      resourceId,
      userId,
      grantedAt: new Date(),
    });

    return this.resourceIntroductionUserRepository.save(permission);
  }

  async removeIntroducer(resourceId: number, userId: number): Promise<void> {
    const introductionPermission =
      await this.resourceIntroductionUserRepository.findOne({
        where: {
          resourceId,
          userId,
        },
      });

    if (!introductionPermission) {
      throw new MissingIntroductionPermissionException();
    }

    await this.resourceIntroductionUserRepository.delete(
      introductionPermission.id
    );
  }

  async getResourceIntroducers(
    resourceId: number
  ): Promise<ResourceIntroductionUser[]> {
    return this.resourceIntroductionUserRepository.find({
      where: { resourceId },
      relations: ['user'],
    });
  }

  /**
   * Determine if an introduction is revoked based on its history
   */
  async isIntroductionRevoked(introductionId: number): Promise<boolean> {
    const latestHistory =
      await this.resourceIntroductionHistoryRepository.findOne({
        where: { introductionId },
        order: { createdAt: 'DESC' },
      });

    // If there's no history, it's not revoked
    if (!latestHistory) {
      return false;
    }

    // If the latest action is REVOKE, then it's revoked
    return latestHistory.action === IntroductionHistoryAction.REVOKE;
  }

  /**
   * Get all history entries for an introduction
   */
  async getIntroductionHistory(
    introductionId: number
  ): Promise<ResourceIntroductionHistoryItem[]> {
    const introduction = await this.resourceIntroductionRepository.findOne({
      where: { id: introductionId },
    });

    if (!introduction) {
      throw new ResourceIntroductionNotFoundException(introductionId);
    }

    return this.resourceIntroductionHistoryRepository.find({
      where: { introductionId },
      relations: ['performedByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Revoke an introduction
   */
  async revokeIntroduction(
    introductionId: number,
    performedByUserId: number,
    comment?: string
  ): Promise<ResourceIntroductionHistoryItem> {
    const introduction = await this.resourceIntroductionRepository.findOne({
      where: { id: introductionId },
    });

    if (!introduction) {
      throw new ResourceIntroductionNotFoundException(introductionId);
    }

    // Check if it's already revoked
    const isRevoked = await this.isIntroductionRevoked(introductionId);
    if (isRevoked) {
      throw new BadRequestException('This introduction is already revoked');
    }

    // Create history entry
    const historyEntry = this.resourceIntroductionHistoryRepository.create({
      introductionId,
      action: IntroductionHistoryAction.REVOKE,
      performedByUserId,
      comment: comment || null,
    });

    return this.resourceIntroductionHistoryRepository.save(historyEntry);
  }

  /**
   * Unrevoke an introduction
   */
  async unrevokeIntroduction(
    introductionId: number,
    performedByUserId: number,
    comment?: string
  ): Promise<ResourceIntroductionHistoryItem> {
    const introduction = await this.resourceIntroductionRepository.findOne({
      where: { id: introductionId },
    });

    if (!introduction) {
      throw new ResourceIntroductionNotFoundException(introductionId);
    }

    // Check if it's already unrevoked (not revoked)
    const isRevoked = await this.isIntroductionRevoked(introductionId);
    if (!isRevoked) {
      throw new BadRequestException('This introduction is not revoked');
    }

    // Create history entry
    const historyEntry = this.resourceIntroductionHistoryRepository.create({
      introductionId,
      action: IntroductionHistoryAction.UNREVOKE,
      performedByUserId,
      comment: comment || null,
    });

    return this.resourceIntroductionHistoryRepository.save(historyEntry);
  }

  /**
   * Check if a user has a valid introduction for a resource
   * A valid introduction is one that exists and is not revoked
   */
  async hasValidIntroduction(
    resourceId: number,
    introductionReceiverUserId: number
  ): Promise<boolean> {
    const introduction = await this.resourceIntroductionRepository.findOne({
      where: {
        resourceId,
        receiverUserId: introductionReceiverUserId,
      },
    });

    // If no introduction exists, return false
    if (!introduction?.completedAt) {
      return false;
    }

    // Check if it's revoked
    const isRevoked = await this.isIntroductionRevoked(introduction.id);

    // Valid if it exists and is not revoked
    return !isRevoked;
  }

  // Get a single resource introduction by ID
  async getResourceIntroductionById(
    resourceId: number,
    introductionId: number
  ): Promise<ResourceIntroduction> {
    const introduction = await this.resourceIntroductionRepository.findOne({
      where: {
        id: introductionId,
        resourceId,
      },
      relations: ['receiverUser', 'tutorUser'],
    });

    if (!introduction) {
      throw new ResourceIntroductionNotFoundException(introductionId);
    }

    return introduction;
  }

  /**
   * Check if a user can manage introductions for a specific resource
   */
  async canManageIntroductions(
    resourceId: number,
    userId: number
  ): Promise<boolean> {
    // By default, check if the user is an introducer for this resource
    const isIntroducer = await this.resourceIntroductionUserRepository.findOne({
      where: {
        resourceId,
        userId,
      },
    });

    const user = await this.usersService.findOne({ id: userId });
    const isResourceManager = user.systemPermissions.canManageResources;

    return !!isIntroducer || isResourceManager;
  }

  /**
   * Check if a user can manage introducers for a specific resource
   */
  async canManageIntroducers(
    resourceId: number,
    userId: number
  ): Promise<boolean> {
    // For now, the permission to manage introducers is a higher level of access
    // We'll check if the user has introductions that they've given
    const introductionsGiven = await this.resourceIntroductionRepository.count({
      where: {
        resourceId,
        tutorUserId: userId,
      },
    });

    return introductionsGiven > 0;
  }
}
