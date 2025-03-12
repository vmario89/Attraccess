import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ResourcePermissionsGuard } from './resourcePermissions.guard';
import { ResourcesService } from '../resources.service';
import { createMock } from '@golevelup/ts-jest';
import { ResourceNotFoundException } from '../../exceptions/resource.notFound.exception';

interface RequestWithUser {
  user: {
    id: number;
    systemPermissions: Record<string, boolean>;
  } | null;
  params: {
    id: string;
  };
}

describe('ResourcePermissionsGuard', () => {
  let guard: ResourcePermissionsGuard;
  let resourcesService: ResourcesService;
  let mockContext: ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcePermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ResourcesService,
          useValue: {
            getResourceById: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<ResourcePermissionsGuard>(ResourcePermissionsGuard);
    resourcesService = module.get<ResourcesService>(ResourcesService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockRequest: RequestWithUser;

    beforeEach(() => {
      mockRequest = {
        user: {
          id: 1,
          systemPermissions: {},
        },
        params: {
          id: '1',
        },
      };

      mockContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      });
    });

    it('should throw UnauthorizedException when no user in request', async () => {
      mockRequest.user = null;

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should allow access if user has system-wide resource management permission', async () => {
      mockRequest.user.systemPermissions = {
        canManageResources: true,
      };

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(resourcesService.getResourceById).not.toHaveBeenCalled();
    });

    it('should throw ResourceNotFoundException if resource not found', async () => {
      jest.spyOn(resourcesService, 'getResourceById').mockResolvedValue(null);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        ResourceNotFoundException
      );
    });
  });
});
