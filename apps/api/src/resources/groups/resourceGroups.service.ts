import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ResourceGroup, Resource } from '@attraccess/database-entities';
import { CreateResourceGroupDto } from './dto/create-resource-group.dto';
import { UpdateResourceGroupDto } from './dto/update-resource-group.dto';
import { PaginatedResponse, makePaginatedResponse } from '../../types/response';

@Injectable()
export class ResourceGroupsService {
  constructor(
    @InjectRepository(ResourceGroup)
    private readonly resourceGroupRepository: Repository<ResourceGroup>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>
  ) {}

  async createResourceGroup(createResourceGroupDto: CreateResourceGroupDto): Promise<ResourceGroup> {
    const resourceGroup = this.resourceGroupRepository.create(createResourceGroupDto);
    return this.resourceGroupRepository.save(resourceGroup);
  }

  async listResourceGroups(page = 1, limit = 10, search?: string): Promise<PaginatedResponse<ResourceGroup>> {
    const where = search ? [{ name: ILike(`%${search}%`) }, { description: ILike(`%${search}%`) }] : {};

    const [data, total] = await this.resourceGroupRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        name: 'ASC', // or createdAt: 'DESC' depending on desired default sort
      },
    });

    return makePaginatedResponse({ page, limit }, data, total);
  }

  async getResourceGroupById(id: number): Promise<ResourceGroup> {
    const resourceGroup = await this.resourceGroupRepository.findOne({ where: { id } });
    if (!resourceGroup) {
      // Consider creating a specific ResourceGroupNotFoundException
      throw new NotFoundException(`ResourceGroup with ID ${id} not found`);
    }
    return resourceGroup;
  }

  async updateResourceGroup(id: number, updateResourceGroupDto: UpdateResourceGroupDto): Promise<ResourceGroup> {
    // getResourceGroupById will throw NotFoundException if not found
    const resourceGroup = await this.getResourceGroupById(id);

    // Update the entity
    this.resourceGroupRepository.merge(resourceGroup, updateResourceGroupDto);
    return this.resourceGroupRepository.save(resourceGroup);
  }

  async deleteResourceGroup(id: number): Promise<void> {
    // Check if exists first (getResourceGroupById handles not found)
    await this.getResourceGroupById(id);

    const result = await this.resourceGroupRepository.delete(id);
    // This check is technically redundant due to getResourceGroupById, but provides safety
    if (result.affected === 0) {
      throw new NotFoundException(`ResourceGroup with ID ${id} not found`);
    }
  }

  async addResourceToGroup(resourceId: number, groupId: number): Promise<void> {
    const group = await this.resourceGroupRepository.findOne({
      where: { id: groupId },
      relations: ['resources'],
    });
    if (!group) {
      throw new NotFoundException(`ResourceGroup with ID ${groupId} not found`);
    }

    const resource = await this.resourceRepository.findOne({ where: { id: resourceId } });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    const resourceExists = group.resources.some((r) => r.id === resourceId);
    if (resourceExists) {
      return;
    }

    group.resources.push(resource);
    await this.resourceGroupRepository.save(group);
  }

  async removeResourceFromGroup(resourceId: number, groupId: number): Promise<void> {
    const group = await this.resourceGroupRepository.findOne({
      where: { id: groupId },
      relations: ['resources'],
    });
    if (!group) {
      throw new NotFoundException(`ResourceGroup with ID ${groupId} not found`);
    }

    const initialLength = group.resources.length;
    group.resources = group.resources.filter((r) => r.id !== resourceId);

    if (group.resources.length === initialLength) {
      throw new NotFoundException(`Resource ${resourceId} not found in group ${groupId}`);
    }

    await this.resourceGroupRepository.save(group);
  }
}
