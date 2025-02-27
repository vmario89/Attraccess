import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ResourceIntroduction,
  User,
  ResourceIntroductionUser,
} from '@attraccess/database-entities';
import { ResourcesService } from '../resources.service';

@Injectable()
export class ResourceIntroductionService {
  constructor(
    @InjectRepository(ResourceIntroduction)
    private resourceIntroductionRepository: Repository<ResourceIntroduction>,
    @InjectRepository(ResourceIntroductionUser)
    private resourceIntroductionUserRepository: Repository<ResourceIntroductionUser>,
    private resourcesService: ResourcesService
  ) {}

  async createIntroduction(
    resourceId: number,
    tutorUserId: number,
    introductionReceiverUserId: number
  ): Promise<ResourceIntroduction> {
    // Check if resource exists
    const resource = await this.resourcesService.getResourceById(resourceId);
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    // Check if the completing user has permission to give introductions
    const hasPermission = await this.canGiveIntroductions(
      resourceId,
      tutorUserId
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to give introductions for this resource'
      );
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
      throw new BadRequestException('Introduction already completed');
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

    return !!permission;
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
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
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
      throw new BadRequestException('User already has introduction permission');
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
    const permission = await this.resourceIntroductionUserRepository.findOne({
      where: {
        resourceId,
        userId,
      },
    });

    if (!permission) {
      throw new NotFoundException('User does not have introduction permission');
    }

    await this.resourceIntroductionUserRepository.delete(permission.id);
  }

  async getResourceIntroducers(
    resourceId: number
  ): Promise<ResourceIntroductionUser[]> {
    return this.resourceIntroductionUserRepository.find({
      where: { resourceId },
      relations: ['user'],
    });
  }
}
