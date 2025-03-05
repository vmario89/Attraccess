import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceIntroductionUser } from '@attraccess/database-entities';
import { ResourcesService } from '../resources.service';
import { ResourceNotFoundException } from '../../exceptions/resource.notFound.exception';

@Injectable()
export class ResourceIntroductionUserService {
  constructor(
    @InjectRepository(ResourceIntroductionUser)
    private resourceIntroductionUserRepository: Repository<ResourceIntroductionUser>,
    private resourcesService: ResourcesService
  ) {}

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

  async canIntroduce(resourceId: number, userId: number): Promise<boolean> {
    const permission = await this.resourceIntroductionUserRepository.findOne({
      where: {
        resourceId,
        userId,
      },
    });

    return !!permission;
  }

  async getResourceIntroducers(
    resourceId: number
  ): Promise<ResourceIntroductionUser[]> {
    return this.resourceIntroductionUserRepository.find({
      where: { resourceId },
      relations: ['user'],
    });
  }

  async getUserIntroductionPermissions(
    userId: number
  ): Promise<ResourceIntroductionUser[]> {
    return this.resourceIntroductionUserRepository.find({
      where: { userId },
      relations: ['resource'],
    });
  }
}
