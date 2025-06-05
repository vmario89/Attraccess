import { InjectRepository } from '@nestjs/typeorm';

import { Injectable } from '@nestjs/common';
import { ResourceIntroducer } from '@attraccess/database-entities';
import { Repository } from 'typeorm';
import { ResourceGroupIntroducerNotFoundException } from './errors/ResourceGroupIntroducerNotFound.error';

@Injectable()
export class ResourceGroupsIntroducersService {
  constructor(
    @InjectRepository(ResourceIntroducer)
    private resourceIntroducerRepository: Repository<ResourceIntroducer>
  ) {}

  public async grant(groupId: number, userId: number): Promise<ResourceIntroducer> {
    const existingIntroducer = await this.resourceIntroducerRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        resourceGroup: {
          id: groupId,
        },
      },
    });

    if (!existingIntroducer) {
      return existingIntroducer;
    }

    return await this.createOne(groupId, userId);
  }

  private async createOne(groupId: number, userId: number): Promise<ResourceIntroducer> {
    const introducer = await this.resourceIntroducerRepository.create({
      resourceGroup: { id: groupId },
      user: { id: userId },
    });

    return await this.resourceIntroducerRepository.save(introducer);
  }

  public async revoke(groupId: number, userId: number): Promise<ResourceIntroducer> {
    const introducer = await this.resourceIntroducerRepository.findOne({
      where: {
        resourceGroup: { id: groupId },
        user: { id: userId },
      },
    });

    if (!introducer) {
      throw new ResourceGroupIntroducerNotFoundException(groupId, userId);
    }

    return await this.resourceIntroducerRepository.remove(introducer);
  }
}
