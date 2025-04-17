import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, IsNull } from 'typeorm';
import { Resource } from '@attraccess/database-entities';
import { CreateResourceDto } from './dtos/createResource.dto';
import { UpdateResourceDto } from './dtos/updateResource.dto';
import { PaginatedResponse, makePaginatedResponse } from '../types/response';
import { ResourceImageService } from '../common/services/resource-image.service';
import { FileUpload } from '../common/types/file-upload.types';
import { ResourceNotFoundException } from '../exceptions/resource.notFound.exception';
import { ResourceGroupsService } from './groups/resourceGroups.service';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
    private resourceImageService: ResourceImageService,
    private resourceGroupsService: ResourceGroupsService
  ) {}

  async createResource(dto: CreateResourceDto, image?: FileUpload): Promise<Resource> {
    const resource = this.resourceRepository.create({
      name: dto.name,
      description: dto.description,
    });

    // Save the resource first to get an ID
    await this.resourceRepository.save(resource);

    if (image) {
      resource.imageFilename = await this.resourceImageService.saveImage(resource.id, image);
      await this.resourceRepository.save(resource).catch(async (error) => {
        // delete the resource if the image save fails
        await this.resourceRepository.delete(resource.id);
        throw error;
      });
    }

    return resource;
  }

  async getResourceById(id: number): Promise<Resource | null> {
    const resource = await this.resourceRepository.findOne({
      where: { id },
      relations: ['introductions', 'usages', 'groups'],
    });

    console.log('resource', resource);

    if (!resource) {
      throw new ResourceNotFoundException(id);
    }

    return resource;
  }

  async updateResource(id: number, dto: UpdateResourceDto, image?: FileUpload): Promise<Resource> {
    const resource = await this.getResourceById(id);

    // Update only provided fields
    if (dto.name !== undefined) resource.name = dto.name;
    if (dto.description !== undefined) resource.description = dto.description;

    if (image) {
      // Delete old image if it exists
      if (resource.imageFilename) {
        await this.resourceImageService.deleteImage(id, resource.imageFilename);
      }
      resource.imageFilename = await this.resourceImageService.saveImage(id, image);
    }

    return this.resourceRepository.save(resource);
  }

  async deleteResource(id: number): Promise<void> {
    const resource = await this.getResourceById(id);

    // Delete associated image if it exists
    if (resource.imageFilename) {
      await this.resourceImageService.deleteImage(id, resource.imageFilename);
    }

    const result = await this.resourceRepository.delete(id);
    if (result.affected === 0) {
      throw new ResourceNotFoundException(id);
    }
  }

  async listResources(page = 1, limit = 10, search?: string, groupId?: number): Promise<PaginatedResponse<Resource>> {
    let where: FindOptionsWhere<Resource> | FindOptionsWhere<Resource>[] = [];

    if (search) {
      where = [
        {
          name: ILike(`%${search}%`),
        },
        {
          description: ILike(`%${search}%`),
        },
      ];
    }

    let groupFilter: ReturnType<typeof IsNull> | number | undefined;

    if (groupId === -1) {
      groupFilter = IsNull();
    } else if (groupId !== undefined) {
      groupFilter = groupId;
    }

    if (groupFilter) {
      if (!search) {
        where = { groups: { id: groupFilter } };
      } else {
        where.forEach((condition) => {
          condition.groups = { id: groupFilter };
        });
      }
    }

    const [resources, total] = await this.resourceRepository.findAndCount({
      where,
      relations: ['groups'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return makePaginatedResponse({ page, limit }, resources, total);
  }

  async addResourceToGroup(resourceId: number, groupId: number): Promise<void> {
    // Ensure resource exists first (optional, group service might also check)
    await this.getResourceById(resourceId);
    // Call the method in ResourceGroupsService
    await this.resourceGroupsService.addResourceToGroup(resourceId, groupId);
  }

  async removeResourceFromGroup(resourceId: number, groupId: number): Promise<void> {
    // Ensure resource exists first (optional, group service might also check)
    await this.getResourceById(resourceId);
    // Call the method in ResourceGroupsService
    await this.resourceGroupsService.removeResourceFromGroup(resourceId, groupId);
  }
}
