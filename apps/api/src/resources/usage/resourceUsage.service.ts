import { Injectable, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, FindOneOptions } from 'typeorm';
import { Resource, ResourceUsage, User } from '@fabaccess/database-entities';
import { StartUsageSessionDto } from './dtos/startUsageSession.dto';
import { EndUsageSessionDto } from './dtos/endUsageSession.dto';
import { ResourceNotFoundException } from '../../exceptions/resource.notFound.exception';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ResourceUsageStartedEvent,
  ResourceUsageEndedEvent,
  ResourceUsageTakenOverEvent,
} from './events/resource-usage.events';
import { ResourceIntroductionsService } from '../introductions/resouceIntroductions.service';
import { ResourceIntroducersService } from '../introducers/resourceIntroducers.service';
import { ResourceGroupsIntroductionsService } from '../groups/introductions/resourceGroups.introductions.service';
import { ResourceGroupsIntroducersService } from '../groups/introducers/resourceGroups.introducers.service';
import { ResourceGroupsService } from '../groups/resourceGroups.service';

@Injectable()
export class ResourceUsageService {
  private readonly logger = new Logger(ResourceUsageService.name);

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(ResourceUsage)
    private readonly resourceUsageRepository: Repository<ResourceUsage>,
    private readonly resourceIntroductionService: ResourceIntroductionsService,
    private readonly resourceIntroducersService: ResourceIntroducersService,
    private readonly resourceGroupsIntroductionsService: ResourceGroupsIntroductionsService,
    private readonly resourceGroupsIntroducersService: ResourceGroupsIntroducersService,
    private readonly resourceGroupsService: ResourceGroupsService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  public async canControllResource(resourceId: number, user: User): Promise<boolean> {
    this.logger.debug(`Checking if user ${user.id} can control resource ${resourceId}`);

    if (user.systemPermissions?.canManageResources) {
      this.logger.debug(`User ${user.id} has system permissions to manage resources`);
      return true;
    }

    if (await this.resourceIntroductionService.hasValidIntroduction(resourceId, user.id)) {
      this.logger.debug(`User ${user.id} has valid introduction for resource ${resourceId}`);
      return true;
    }

    if (await this.resourceIntroducersService.isIntroducer(resourceId, user.id)) {
      this.logger.debug(`User ${user.id} is an introducer for resource ${resourceId}`);
      return true;
    }

    const groupsOfResource = await this.resourceGroupsService.getGroupsOfResource(resourceId);
    for (const group of groupsOfResource) {
      if (await this.resourceGroupsIntroductionsService.hasValidIntroduction({ groupId: group.id, userId: user.id })) {
        this.logger.debug(`User ${user.id} has valid group introduction for resource ${resourceId}`);
        return true;
      }

      if (await this.resourceGroupsIntroducersService.isIntroducer({ groupId: group.id, userId: user.id })) {
        this.logger.debug(`User ${user.id} is a group introducer for resource ${resourceId}`);
        return true;
      }
    }

    this.logger.debug(`User ${user.id} cannot control resource ${resourceId}`);
    return false;
  }

  async startSession(resourceId: number, user: User, dto: StartUsageSessionDto): Promise<ResourceUsage> {
    this.logger.debug(`Starting session for resource ${resourceId} by user ${user.id}`, { dto });

    const resource = await this.resourceRepository.findOne({ where: { id: resourceId } });
    if (!resource) {
      this.logger.warn(`Resource ${resourceId} not found`);
      throw new ResourceNotFoundException(resourceId);
    }
    this.logger.debug(`Found resource ${resourceId}: ${resource.name}`);

    const canStartSession = await this.canControllResource(resourceId, user);

    if (!canStartSession) {
      this.logger.warn(`User ${user.id} cannot control resource ${resourceId} - missing introduction`);
      throw new BadRequestException('You must complete the resource introduction before using it');
    }

    const existingActiveSession = await this.getActiveSession(resourceId);
    if (existingActiveSession) {
      this.logger.debug(
        `Found existing active session for resource ${resourceId} by user ${existingActiveSession.user.id}`
      );

      // If there's an active session, check if takeover is allowed
      if (dto.forceTakeOver && resource.allowTakeOver) {
        this.logger.debug(
          `Forcing takeover of resource ${resourceId} from user ${existingActiveSession.user.id} to user ${user.id}`
        );

        // End the existing session with a note about takeover
        await this.resourceUsageRepository
          .createQueryBuilder()
          .update(ResourceUsage)
          .set({
            endTime: new Date(),
            endNotes: `Session ended due to takeover by user ${user.id}`,
          })
          .where('id = :id', { id: existingActiveSession.id })
          .execute();
      } else if (dto.forceTakeOver && !resource.allowTakeOver) {
        this.logger.warn(`Takeover attempted for resource ${resourceId} but not allowed`);
        throw new BadRequestException('This resource does not allow overtaking');
      } else {
        this.logger.warn(`Resource ${resourceId} is currently in use by user ${existingActiveSession.user.id}`);
        throw new BadRequestException('Resource is currently in use by another user');
      }
    }

    const usageData = {
      resourceId,
      userId: user.id,
      startTime: new Date(),
      startNotes: dto.notes,
      endTime: null,
      endNotes: null,
    };

    this.logger.debug(`Creating new usage session for resource ${resourceId}`, { usageData });

    await this.resourceUsageRepository.createQueryBuilder().insert().into(ResourceUsage).values(usageData).execute();

    const newSession = await this.resourceUsageRepository.findOne({
      where: {
        resourceId,
        userId: user.id,
        endTime: IsNull(),
      },
      order: {
        startTime: 'DESC',
      },
      relations: ['resource', 'user'],
    });

    if (!newSession) {
      this.logger.error(`Failed to retrieve newly created session for resource ${resourceId} and user ${user.id}`);
      throw new Error('Failed to retrieve the newly created session.');
    }

    this.logger.debug(`Successfully created session ${newSession.id} for resource ${resourceId} by user ${user.id}`);

    if (existingActiveSession) {
      const now = new Date();
      // Emit event for the takeover
      this.eventEmitter.emit(
        'resource.usage.taken_over',
        new ResourceUsageTakenOverEvent(resourceId, now, user, existingActiveSession.user)
      );
    } else {
      // Emit event after successful save
      this.eventEmitter.emit(
        'resource.usage.started',
        new ResourceUsageStartedEvent(resourceId, usageData.startTime, user)
      );
    }

    return newSession;
  }

  async endSession(resourceId: number, user: User, dto: EndUsageSessionDto): Promise<ResourceUsage> {
    this.logger.debug(`Ending session for resource ${resourceId} by user ${user.id}`, { dto });

    // Find active session
    const activeSession = await this.getActiveSession(resourceId);
    if (!activeSession) {
      this.logger.warn(`No active session found for resource ${resourceId}`);
      throw new BadRequestException('No active session found');
    }

    this.logger.debug(
      `Found active session ${activeSession.id} for resource ${resourceId} owned by user ${activeSession.user.id}`
    );

    // Check if the user is authorized to end the session
    const canManageResources = user.systemPermissions?.canManageResources || false;
    const isSessionOwner = activeSession.user.id === user.id; // Use loaded user ID

    this.logger.debug(
      `Authorization check: canManageResources=${canManageResources}, isSessionOwner=${isSessionOwner}`
    );

    if (!isSessionOwner && !canManageResources) {
      this.logger.warn(
        `User ${user.id} not authorized to end session ${activeSession.id} owned by user ${activeSession.user.id}`
      );
      throw new ForbiddenException('You are not authorized to end this session');
    }

    const endTime = new Date();

    this.logger.debug(`Ending session ${activeSession.id} at ${endTime.toISOString()}`);

    // Update session with end time and notes - using explicit update to avoid the generated column
    await this.resourceUsageRepository
      .createQueryBuilder()
      .update(ResourceUsage)
      .set({
        endTime,
        endNotes: dto.notes,
      })
      .where('id = :id', { id: activeSession.id })
      .execute();

    this.logger.debug(`Successfully ended session ${activeSession.id}`);

    // Emit event after successful save
    this.eventEmitter.emit(
      'resource.usage.ended',
      new ResourceUsageEndedEvent(resourceId, activeSession.startTime, endTime, activeSession.user)
    );

    // Fetch the updated record
    const updatedSession = await this.resourceUsageRepository.findOne({
      where: { id: activeSession.id },
      relations: ['resource', 'user'],
    });

    this.logger.debug(`Retrieved updated session ${activeSession.id} after ending`);

    return updatedSession;
  }

  async getActiveSession(resourceId: number): Promise<ResourceUsage | null> {
    this.logger.debug(`Getting active session for resource ${resourceId}`);

    const activeSession = await this.resourceUsageRepository.findOne({
      where: {
        resourceId,
        endTime: IsNull(),
      },
      relations: ['user'],
    });

    if (activeSession) {
      this.logger.debug(
        `Found active session ${activeSession.id} for resource ${resourceId} by user ${activeSession.user.id}`
      );
    } else {
      this.logger.debug(`No active session found for resource ${resourceId}`);
    }

    return activeSession;
  }

  async getResourceUsageHistory(
    resourceId: number,
    page = 1,
    limit = 10,
    userId?: number
  ): Promise<{ data: ResourceUsage[]; total: number }> {
    this.logger.debug(`Getting usage history for resource ${resourceId}`, { page, limit, userId });

    const whereClause: FindOneOptions<ResourceUsage>['where'] = { resourceId };

    // Add userId filter if provided
    if (userId) {
      whereClause.userId = userId;
      this.logger.debug(`Filtering usage history by userId ${userId}`);
    }

    const [data, total] = await this.resourceUsageRepository.findAndCount({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      order: { startTime: 'DESC' },
      relations: ['user'],
    });

    this.logger.debug(`Found ${data.length} usage records out of ${total} total for resource ${resourceId}`);

    return { data, total };
  }

  async getUserUsageHistory(userId: number, page = 1, limit = 10): Promise<{ data: ResourceUsage[]; total: number }> {
    this.logger.debug(`Getting usage history for user ${userId}`, { page, limit });

    const [data, total] = await this.resourceUsageRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { startTime: 'DESC' },
      relations: ['resource'],
    });

    this.logger.debug(`Found ${data.length} usage records out of ${total} total for user ${userId}`);

    return { data, total };
  }
}
