import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, FindOneOptions } from 'typeorm';
import { ResourceUsage, User } from '@attraccess/database-entities';
import { ResourcesService } from '../resources.service';
import { StartUsageSessionDto } from './dtos/startUsageSession.dto';
import { EndUsageSessionDto } from './dtos/endUsageSession.dto';
import { ResourceIntroductionService } from '../introduction/resourceIntroduction.service';

@Injectable()
export class ResourceUsageService {
  constructor(
    @InjectRepository(ResourceUsage)
    private resourceUsageRepository: Repository<ResourceUsage>,
    private resourcesService: ResourcesService,
    private resourceIntroductionService: ResourceIntroductionService
  ) {}

  async startSession(
    resourceId: number,
    user: User,
    dto: StartUsageSessionDto
  ): Promise<ResourceUsage> {
    // Check if resource exists and is ready
    const resource = await this.resourcesService.getResourceById(resourceId);
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    // Check if user has completed the introduction
    const hasCompletedIntroduction =
      await this.resourceIntroductionService.hasCompletedIntroduction(
        resourceId,
        user.id
      );
    if (!hasCompletedIntroduction) {
      throw new BadRequestException(
        'You must complete the resource introduction before using it'
      );
    }

    // Check if user has an active session
    const activeSession = await this.getActiveSession(resourceId, user.id);
    if (activeSession) {
      throw new BadRequestException('User already has an active session');
    }

    // Create new usage session
    const usage = this.resourceUsageRepository.create({
      resourceId,
      userId: user.id,
      startTime: new Date(),
      startNotes: dto.notes,
    });

    return this.resourceUsageRepository.save(usage);
  }

  async endSession(
    resourceId: number,
    user: User,
    dto: EndUsageSessionDto
  ): Promise<ResourceUsage> {
    // Find active session
    const activeSession = await this.getActiveSession(resourceId, user.id);
    if (!activeSession) {
      throw new BadRequestException('No active session found');
    }

    // Update session end time and notes
    activeSession.endTime = dto.endTime || new Date();
    if (dto.notes) {
      activeSession.endNotes = dto.notes;
    }

    // Calculate duration in hours (rounded to 2 decimal places)
    const durationMs =
      activeSession.endTime.getTime() - activeSession.startTime.getTime();
    const durationHours =
      Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100;
    activeSession.duration = durationHours;

    const savedSession = await this.resourceUsageRepository.save(activeSession);

    // Update resource total usage hours
    await this.resourcesService.updateTotalUsageHours(
      resourceId,
      durationHours
    );

    return savedSession;
  }

  async getActiveSession(
    resourceId: number,
    userId: number
  ): Promise<ResourceUsage | null> {
    console.log(
      'Getting active session for resource:',
      resourceId,
      'and user:',
      userId
    );
    return await this.resourceUsageRepository.findOne({
      where: {
        resourceId,
        userId,
        endTime: IsNull(),
      },
    });
  }

  async getResourceUsageHistory(
    resourceId: number,
    page = 1,
    limit = 10,
    userId?: number
  ): Promise<{ data: ResourceUsage[]; total: number }> {
    const whereClause: FindOneOptions<ResourceUsage>['where'] = { resourceId };

    // Add userId filter if provided
    if (userId) {
      whereClause.userId = userId;
    }

    const [data, total] = await this.resourceUsageRepository.findAndCount({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      order: { startTime: 'DESC' },
      relations: ['user'],
    });

    return { data, total };
  }

  async getUserUsageHistory(
    userId: number,
    page = 1,
    limit = 10
  ): Promise<{ data: ResourceUsage[]; total: number }> {
    const [data, total] = await this.resourceUsageRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { startTime: 'DESC' },
      relations: ['resource'],
    });

    return { data, total };
  }
}
