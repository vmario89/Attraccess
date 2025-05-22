import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { ResourcesService } from './resources.service';
import { ResourceImageService } from '../common/services/resource-image.service';
import { ResourceGroupsService } from './groups/resourceGroups.service';
import { Resource, DocumentationType } from '@attraccess/database-entities';
import { CreateResourceDto } from './dtos/createResource.dto';
import { UpdateResourceDto } from './dtos/updateResource.dto';
import { ResourceNotFoundException } from '../exceptions/resource.notFound.exception';

type MockRepository<T = unknown> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = unknown>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('ResourcesService', () => {
  let service: ResourcesService;
  let resourceRepository: MockRepository<Resource>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        {
          provide: getRepositoryToken(Resource),
          useValue: createMockRepository(),
        },
        {
          provide: ResourceImageService,
          useValue: {
            saveImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
        {
          provide: ResourceGroupsService,
          useValue: {
            addResourceToGroup: jest.fn(),
            removeResourceFromGroup: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
    resourceRepository = module.get(getRepositoryToken(Resource));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createResource', () => {
    it('should create a resource with markdown documentation', async () => {
      const createDto: CreateResourceDto = {
        name: 'Test Resource',
        description: 'Test Description',
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Test Documentation\n\nThis is a test documentation.',
      };

      const resource = {
        id: 1,
        name: 'Test Resource',
        description: 'Test Description',
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Test Documentation\n\nThis is a test documentation.',
        documentationUrl: null,
      };

      resourceRepository.create.mockReturnValue(resource);
      resourceRepository.save.mockResolvedValue(resource);

      const result = await service.createResource(createDto);

      expect(result).toEqual(resource);
      expect(resourceRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        description: createDto.description,
        documentationType: createDto.documentationType,
        documentationMarkdown: createDto.documentationMarkdown,
        documentationUrl: null,
      });
      expect(resourceRepository.save).toHaveBeenCalledWith(resource);
    });

    it('should create a resource with URL documentation', async () => {
      const createDto: CreateResourceDto = {
        name: 'Test Resource',
        description: 'Test Description',
        documentationType: DocumentationType.URL,
        documentationUrl: 'https://example.com/docs',
      };

      const resource = {
        id: 1,
        name: 'Test Resource',
        description: 'Test Description',
        documentationType: DocumentationType.URL,
        documentationMarkdown: null,
        documentationUrl: 'https://example.com/docs',
      };

      resourceRepository.create.mockReturnValue(resource);
      resourceRepository.save.mockResolvedValue(resource);

      const result = await service.createResource(createDto);

      expect(result).toEqual(resource);
      expect(resourceRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        description: createDto.description,
        documentationType: createDto.documentationType,
        documentationMarkdown: null,
        documentationUrl: createDto.documentationUrl,
      });
      expect(resourceRepository.save).toHaveBeenCalledWith(resource);
    });
  });

  describe('updateResource', () => {
    it('should update a resource with markdown documentation', async () => {
      const resourceId = 1;
      const updateDto: UpdateResourceDto = {
        name: 'Updated Resource',
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Updated Documentation\n\nThis is updated documentation.',
      };

      const existingResource = {
        id: resourceId,
        name: 'Test Resource',
        description: 'Test Description',
        imageFilename: null,
        documentationType: null,
        documentationMarkdown: null,
        documentationUrl: null,
      };

      const updatedResource = {
        ...existingResource,
        name: updateDto.name,
        documentationType: updateDto.documentationType,
        documentationMarkdown: updateDto.documentationMarkdown,
        documentationUrl: null,
      };

      jest.spyOn(service, 'getResourceById').mockResolvedValue(existingResource as Resource);
      resourceRepository.save.mockResolvedValue(updatedResource);

      const result = await service.updateResource(resourceId, updateDto);

      expect(result).toEqual(updatedResource);
      expect(service.getResourceById).toHaveBeenCalledWith(resourceId);
      expect(resourceRepository.save).toHaveBeenCalledWith({
        ...existingResource,
        name: updateDto.name,
        documentationType: updateDto.documentationType,
        documentationMarkdown: updateDto.documentationMarkdown,
        documentationUrl: null,
      });
    });

    it('should update a resource with URL documentation', async () => {
      const resourceId = 1;
      const updateDto: UpdateResourceDto = {
        documentationType: DocumentationType.URL,
        documentationUrl: 'https://example.com/updated-docs',
      };

      const existingResource = {
        id: resourceId,
        name: 'Test Resource',
        description: 'Test Description',
        imageFilename: null,
        documentationType: null,
        documentationMarkdown: null,
        documentationUrl: null,
      };

      const updatedResource = {
        ...existingResource,
        documentationType: updateDto.documentationType,
        documentationMarkdown: null,
        documentationUrl: updateDto.documentationUrl,
      };

      jest.spyOn(service, 'getResourceById').mockResolvedValue(existingResource as Resource);
      resourceRepository.save.mockResolvedValue(updatedResource);

      const result = await service.updateResource(resourceId, updateDto);

      expect(result).toEqual(updatedResource);
      expect(service.getResourceById).toHaveBeenCalledWith(resourceId);
      expect(resourceRepository.save).toHaveBeenCalledWith({
        ...existingResource,
        documentationType: updateDto.documentationType,
        documentationMarkdown: null,
        documentationUrl: updateDto.documentationUrl,
      });
    });

    it('should update a resource and clear documentation when type changes', async () => {
      const resourceId = 1;
      const updateDto: UpdateResourceDto = {
        documentationType: DocumentationType.URL,
        documentationUrl: 'https://example.com/docs',
      };

      const existingResource = {
        id: resourceId,
        name: 'Test Resource',
        description: 'Test Description',
        imageFilename: null,
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Old Documentation',
        documentationUrl: null,
      };

      const updatedResource = {
        ...existingResource,
        documentationType: updateDto.documentationType,
        documentationMarkdown: null,
        documentationUrl: updateDto.documentationUrl,
      };

      jest.spyOn(service, 'getResourceById').mockResolvedValue(existingResource as Resource);
      resourceRepository.save.mockResolvedValue(updatedResource);

      const result = await service.updateResource(resourceId, updateDto);

      expect(result).toEqual(updatedResource);
      expect(service.getResourceById).toHaveBeenCalledWith(resourceId);
      expect(resourceRepository.save).toHaveBeenCalledWith({
        ...existingResource,
        documentationType: updateDto.documentationType,
        documentationMarkdown: null,
        documentationUrl: updateDto.documentationUrl,
      });
    });
  });

  describe('getResourceById', () => {
    it('should return a resource with documentation by ID', async () => {
      const resourceId = 1;
      const resource = {
        id: resourceId,
        name: 'Test Resource',
        description: 'Test Description',
        imageFilename: null,
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Test Documentation',
        documentationUrl: null,
        introductions: [],
        usages: [],
        groups: [],
      };

      resourceRepository.find.mockResolvedValue([resource]);

      const result = await service.getResourceById(resourceId);

      expect(result).toEqual(resource);
      expect(resourceRepository.find).toHaveBeenCalledWith({
        where: { id: In([resourceId]) },
        relations: ['introductions', 'usages', 'groups'],
      });
    });

    it('should throw ResourceNotFoundException if resource not found', async () => {
      const resourceId = 999;
      resourceRepository.find.mockResolvedValue([]);

      await expect(service.getResourceById(resourceId)).rejects.toThrow(ResourceNotFoundException);
      expect(resourceRepository.find).toHaveBeenCalledWith({
        where: { id: In([resourceId]) },
        relations: ['introductions', 'usages', 'groups'],
      });
    });
  });

  describe('listResources', () => {
    it('should return paginated resources with documentation', async () => {
      const resources = [
        {
          id: 1,
          name: 'Test Resource 1',
          description: 'Test Description 1',
          documentationType: DocumentationType.MARKDOWN,
          documentationMarkdown: '# Test Documentation 1',
          documentationUrl: null,
          groups: [],
        },
        {
          id: 2,
          name: 'Test Resource 2',
          description: 'Test Description 2',
          documentationType: DocumentationType.URL,
          documentationMarkdown: null,
          documentationUrl: 'https://example.com/docs',
          groups: [],
        },
      ];

      resourceRepository.findAndCount.mockResolvedValue([resources, 2]);

      const result = await service.listResources({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: resources,
        meta: {
          page: 1,
          limit: 10,
          totalItems: 2,
          totalPages: 1,
        },
      });
      expect(resourceRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ['groups'],
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('should filter resources by search term', async () => {
      const searchTerm = 'test';
      const resources = [
        {
          id: 1,
          name: 'Test Resource',
          description: 'Test Description',
          documentationType: DocumentationType.MARKDOWN,
          documentationMarkdown: '# Test Documentation',
          documentationUrl: null,
          groups: [],
        },
      ];

      resourceRepository.findAndCount.mockResolvedValue([resources, 1]);

      const result = await service.listResources({ page: 1, limit: 10, search: searchTerm });

      expect(result).toEqual({
        data: resources,
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
        },
      });
      expect(resourceRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          name: ILike(`%${searchTerm}%`),
          description: ILike(`%${searchTerm}%`),
        },
        relations: ['groups'],
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
    });
  });
});