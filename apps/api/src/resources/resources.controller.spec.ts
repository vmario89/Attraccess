import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { ResourceImageService } from '../common/services/resource-image.service';
import { Resource, DocumentationType } from '@attraccess/database-entities';
import { CreateResourceDto } from './dtos/createResource.dto';
import { UpdateResourceDto } from './dtos/updateResource.dto';
import { PaginatedResponse } from '../types/response';

describe('ResourcesController', () => {
  let controller: ResourcesController;
  let resourcesService: ResourcesService;
  let resourceImageService: ResourceImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [
        {
          provide: ResourcesService,
          useValue: {
            createResource: jest.fn(),
            getResourceById: jest.fn(),
            updateResource: jest.fn(),
            deleteResource: jest.fn(),
            listResources: jest.fn(),
            addResourceToGroup: jest.fn(),
            removeResourceFromGroup: jest.fn(),
          },
        },
        {
          provide: ResourceImageService,
          useValue: {
            getPublicPath: jest.fn(),
            saveImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ResourcesController>(ResourcesController);
    resourcesService = module.get<ResourcesService>(ResourcesService);
    resourceImageService = module.get<ResourceImageService>(ResourceImageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOne', () => {
    it('should create a resource with markdown documentation', async () => {
      const createDto: CreateResourceDto = {
        name: 'Test Resource',
        description: 'Test Description',
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Test Documentation\n\nThis is a test documentation.',
      };

      const resource: Resource = {
        id: 1,
        name: 'Test Resource',
        description: 'Test Description',
        imageFilename: null,
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Test Documentation\n\nThis is a test documentation.',
        documentationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        introductions: [],
        usages: [],
        groups: [],
      };

      jest.spyOn(resourcesService, 'createResource').mockResolvedValue(resource);
      jest.spyOn(resourceImageService, 'getPublicPath').mockReturnValue('public/path/to/image');

      const result = await controller.createOne(createDto);

      expect(result).toEqual({
        ...resource,
        imageFilename: 'public/path/to/image',
      });
      expect(resourcesService.createResource).toHaveBeenCalledWith(createDto, undefined);
    });

    it('should create a resource with URL documentation', async () => {
      const createDto: CreateResourceDto = {
        name: 'Test Resource',
        description: 'Test Description',
        documentationType: DocumentationType.URL,
        documentationUrl: 'https://example.com/docs',
      };

      const resource: Resource = {
        id: 1,
        name: 'Test Resource',
        description: 'Test Description',
        imageFilename: null,
        documentationType: DocumentationType.URL,
        documentationMarkdown: null,
        documentationUrl: 'https://example.com/docs',
        createdAt: new Date(),
        updatedAt: new Date(),
        introductions: [],
        usages: [],
        groups: [],
      };

      jest.spyOn(resourcesService, 'createResource').mockResolvedValue(resource);
      jest.spyOn(resourceImageService, 'getPublicPath').mockReturnValue('public/path/to/image');

      const result = await controller.createOne(createDto);

      expect(result).toEqual({
        ...resource,
        imageFilename: 'public/path/to/image',
      });
      expect(resourcesService.createResource).toHaveBeenCalledWith(createDto, undefined);
    });
  });

  describe('updateOne', () => {
    it('should update a resource with markdown documentation', async () => {
      const updateDto: UpdateResourceDto = {
        name: 'Updated Resource',
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Updated Documentation\n\nThis is updated documentation.',
      };

      const resource: Resource = {
        id: 1,
        name: 'Updated Resource',
        description: 'Test Description',
        imageFilename: null,
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Updated Documentation\n\nThis is updated documentation.',
        documentationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        introductions: [],
        usages: [],
        groups: [],
      };

      jest.spyOn(resourcesService, 'updateResource').mockResolvedValue(resource);
      jest.spyOn(resourceImageService, 'getPublicPath').mockReturnValue('public/path/to/image');

      const result = await controller.updateOne(1, updateDto);

      expect(result).toEqual({
        ...resource,
        imageFilename: 'public/path/to/image',
      });
      expect(resourcesService.updateResource).toHaveBeenCalledWith(1, updateDto, undefined);
    });

    it('should update a resource with URL documentation', async () => {
      const updateDto: UpdateResourceDto = {
        documentationType: DocumentationType.URL,
        documentationUrl: 'https://example.com/updated-docs',
      };

      const resource: Resource = {
        id: 1,
        name: 'Test Resource',
        description: 'Test Description',
        imageFilename: null,
        documentationType: DocumentationType.URL,
        documentationMarkdown: null,
        documentationUrl: 'https://example.com/updated-docs',
        createdAt: new Date(),
        updatedAt: new Date(),
        introductions: [],
        usages: [],
        groups: [],
      };

      jest.spyOn(resourcesService, 'updateResource').mockResolvedValue(resource);
      jest.spyOn(resourceImageService, 'getPublicPath').mockReturnValue('public/path/to/image');

      const result = await controller.updateOne(1, updateDto);

      expect(result).toEqual({
        ...resource,
        imageFilename: 'public/path/to/image',
      });
      expect(resourcesService.updateResource).toHaveBeenCalledWith(1, updateDto, undefined);
    });
  });

  describe('getOneById', () => {
    it('should return a resource with documentation', async () => {
      const resource: Resource = {
        id: 1,
        name: 'Test Resource',
        description: 'Test Description',
        imageFilename: 'image.jpg',
        documentationType: DocumentationType.MARKDOWN,
        documentationMarkdown: '# Test Documentation\n\nThis is a test documentation.',
        documentationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        introductions: [],
        usages: [],
        groups: [],
      };

      jest.spyOn(resourcesService, 'getResourceById').mockResolvedValue(resource);
      jest.spyOn(resourceImageService, 'getPublicPath').mockReturnValue('public/path/to/image');

      const result = await controller.getOneById(1);

      expect(result).toEqual({
        ...resource,
        imageFilename: 'public/path/to/image',
      });
      expect(resourcesService.getResourceById).toHaveBeenCalledWith(1);
    });
  });

  describe('getAll', () => {
    it('should return paginated resources with documentation', async () => {
      const resources: Resource[] = [
        {
          id: 1,
          name: 'Test Resource 1',
          description: 'Test Description 1',
          imageFilename: 'image1.jpg',
          documentationType: DocumentationType.MARKDOWN,
          documentationMarkdown: '# Test Documentation 1',
          documentationUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          introductions: [],
          usages: [],
          groups: [],
        },
        {
          id: 2,
          name: 'Test Resource 2',
          description: 'Test Description 2',
          imageFilename: 'image2.jpg',
          documentationType: DocumentationType.URL,
          documentationMarkdown: null,
          documentationUrl: 'https://example.com/docs',
          createdAt: new Date(),
          updatedAt: new Date(),
          introductions: [],
          usages: [],
          groups: [],
        },
      ];

      const paginatedResponse: PaginatedResponse<Resource> = {
        data: resources,
        meta: {
          page: 1,
          limit: 10,
          totalItems: 2,
          totalPages: 1,
        },
      };

      jest.spyOn(resourcesService, 'listResources').mockResolvedValue(paginatedResponse);
      jest.spyOn(resourceImageService, 'getPublicPath').mockImplementation((id, filename) => {
        return `public/path/to/${filename}`;
      });

      const result = await controller.getAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: resources.map(resource => ({
          ...resource,
          imageFilename: `public/path/to/${resource.imageFilename}`,
        })),
        meta: paginatedResponse.meta,
      });
      expect(resourcesService.listResources).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });
  });
});