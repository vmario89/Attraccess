import {
  IntroductionHistoryAction,
  Resource,
  ResourceIntroduction,
  ResourceIntroductionHistoryItem,
} from '@attraccess/database-entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateResourceIntroductionDto } from './dtos/update.request.dto';

@Injectable()
export class ResourceIntroductionsService {
  constructor(
    @InjectRepository(ResourceIntroduction)
    private resourceIntroductionRepository: Repository<ResourceIntroduction>,
    @InjectRepository(ResourceIntroductionHistoryItem)
    private resourceIntroductionHistoryItemRepository: Repository<ResourceIntroductionHistoryItem>
  ) {}

  private async getIntroductionOfUser(resourceId: number, userId: number): Promise<ResourceIntroduction> {
    return await this.resourceIntroductionRepository.findOne({
      where: {
        resource: { id: resourceId },
        receiverUser: { id: userId },
      },
    });
  }

  private async getLastHistoryItemOfIntroduction(introductionId: number): Promise<ResourceIntroductionHistoryItem> {
    return await this.resourceIntroductionHistoryItemRepository.findOne({
      where: {
        introduction: { id: introductionId },
        action: IntroductionHistoryAction.GRANT,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  private async getLastHistoryItemOfUser(
    resourceId: number,
    userId: number
  ): Promise<ResourceIntroductionHistoryItem | null> {
    const introduction = await this.getIntroductionOfUser(resourceId, userId);

    if (!introduction) {
      return null;
    }

    return await this.getLastHistoryItemOfIntroduction(introduction.id);
  }

  private async createOne(resourceId: number, userId: number): Promise<ResourceIntroduction> {
    const introduction = this.resourceIntroductionRepository.create({
      resource: { id: resourceId },
      receiverUser: { id: userId },
    });

    return await this.resourceIntroductionRepository.save(introduction);
  }

  private async updateIntroductionStatus(
    resourceId: number,
    userId: number,
    nextStatus: IntroductionHistoryAction,
    data?: UpdateResourceIntroductionDto
  ) {
    let resourceIntroduction = await this.getIntroductionOfUser(resourceId, userId);

    resourceIntroduction ??= await this.createOne(resourceId, userId);

    const lastHistoryItem = await this.getLastHistoryItemOfUser(resourceId, userId);

    if (lastHistoryItem?.action === nextStatus) {
      return lastHistoryItem;
    }

    const historyItem = this.resourceIntroductionHistoryItemRepository.create({
      introduction: { id: resourceIntroduction.id },
      action: nextStatus,
      comment: data?.comment,
    });

    return await this.resourceIntroductionHistoryItemRepository.save(historyItem);
  }

  public async hasValidIntroduction(resourceId: number, userId: number): Promise<boolean> {
    const lastHistoryItem = await this.getLastHistoryItemOfUser(resourceId, userId);
    return !!lastHistoryItem;
  }

  public async getMany(resourceId: number): Promise<ResourceIntroduction[]> {
    return await this.resourceIntroductionRepository.find({
      where: {
        resource: { id: resourceId },
      },
      relations: ['receiverUser', 'tutorUser'],
    });
  }

  public async grant(
    resourceId: number,
    userId: number,
    data?: UpdateResourceIntroductionDto
  ): Promise<ResourceIntroductionHistoryItem> {
    return await this.updateIntroductionStatus(resourceId, userId, IntroductionHistoryAction.GRANT, data);
  }

  public async revoke(
    resourceId: number,
    userId: number,
    data?: UpdateResourceIntroductionDto
  ): Promise<ResourceIntroductionHistoryItem> {
    return await this.updateIntroductionStatus(resourceId, userId, IntroductionHistoryAction.REVOKE, data);
  }
}
