import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MqttPublisherService } from './mqtt-publisher.service';
import { MqttClientService } from '../../../mqtt/mqtt-client.service';
import { MqttResourceConfig, Resource } from '@attraccess/database-entities';
import { Repository } from 'typeorm';
import {
  ResourceUsageStartedEvent,
  ResourceUsageEndedEvent,
} from '../../usage/events/resource-usage.events';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('MqttPublisherService', () => {
  let service: MqttPublisherService;
  let mockMqttClientService: Partial<MqttClientService>;
  let mockMqttResourceConfigRepository: Partial<Repository<MqttResourceConfig>>;
  let mockResourceRepository: Partial<Repository<Resource>>;
  let mockConfigService: Partial<ConfigService>;

  const mockConfig = {
    resourceId: 1,
    serverId: 2,
    inUseTopic: 'resources/{{id}}/status',
    inUseMessage:
      '{"status":"in_use","resourceId":{{id}},"resourceName":"{{name}}"}',
    notInUseTopic: 'resources/{{id}}/status',
    notInUseMessage:
      '{"status":"not_in_use","resourceId":{{id}},"resourceName":"{{name}}"}',
    server: { id: 2, name: 'Test Server' },
  };

  const mockResource = {
    id: 1,
    name: 'Test Resource',
  };

  beforeEach(async () => {
    mockMqttClientService = {
      publish: jest.fn().mockResolvedValue(undefined),
    };

    mockMqttResourceConfigRepository = {
      findOne: jest.fn().mockResolvedValue(mockConfig),
    };

    mockResourceRepository = {
      findOne: jest.fn().mockResolvedValue(mockResource),
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'DEBUG_MODE') return false;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MqttPublisherService,
        {
          provide: MqttClientService,
          useValue: mockMqttClientService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(MqttResourceConfig),
          useValue: mockMqttResourceConfigRepository,
        },
        {
          provide: getRepositoryToken(Resource),
          useValue: mockResourceRepository,
        },
      ],
    }).compile();

    service = module.get<MqttPublisherService>(MqttPublisherService);

    // Mock logger to prevent console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {
      /* empty function */
    });
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {
      /* empty function */
    });
    jest.spyOn(console, 'error').mockImplementation(() => {
      /* empty function */
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleResourceUsageStarted', () => {
    it('should publish a message when resource usage starts', async () => {
      const event = new ResourceUsageStartedEvent(1, 123, new Date());

      await service.handleResourceUsageStarted(event);

      expect(mockMqttResourceConfigRepository.findOne).toHaveBeenCalledWith({
        where: { resourceId: 1 },
        relations: ['server'],
      });

      expect(mockResourceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockMqttClientService.publish).toHaveBeenCalledWith(
        2, // serverId
        'resources/1/status', // processed topic
        expect.stringContaining('"status":"in_use"') // processed message
      );
    });

    it('should not publish a message if no config is found', async () => {
      mockMqttResourceConfigRepository.findOne = jest
        .fn()
        .mockResolvedValue(null);

      const event = new ResourceUsageStartedEvent(999, 123, new Date());

      await service.handleResourceUsageStarted(event);

      expect(mockMqttClientService.publish).not.toHaveBeenCalled();
    });

    it('should not publish a message if no resource is found', async () => {
      mockResourceRepository.findOne = jest.fn().mockResolvedValue(null);

      const event = new ResourceUsageStartedEvent(1, 123, new Date());

      await service.handleResourceUsageStarted(event);

      expect(mockMqttClientService.publish).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock the publish method to throw an error
      mockMqttClientService.publish = jest
        .fn()
        .mockRejectedValue(new Error('Publish error'));

      // Skip checking the logger and just verify that the method doesn't throw
      const event = new ResourceUsageStartedEvent(1, 123, new Date());

      // The key test is that it should not throw an exception
      await expect(
        service.handleResourceUsageStarted(event)
      ).resolves.not.toThrow();

      // Verify the publish was attempted
      expect(mockMqttClientService.publish).toHaveBeenCalled();
    });
  });

  describe('handleResourceUsageEnded', () => {
    it('should publish a message when resource usage ends', async () => {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 3600000); // 1 hour later
      const event = new ResourceUsageEndedEvent(1, 123, startTime, endTime);

      await service.handleResourceUsageEnded(event);

      expect(mockMqttResourceConfigRepository.findOne).toHaveBeenCalledWith({
        where: { resourceId: 1 },
        relations: ['server'],
      });

      expect(mockResourceRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockMqttClientService.publish).toHaveBeenCalledWith(
        2, // serverId
        'resources/1/status', // processed topic
        expect.stringContaining('"status":"not_in_use"') // processed message
      );
    });

    it('should not publish a message if no config is found', async () => {
      mockMqttResourceConfigRepository.findOne = jest
        .fn()
        .mockResolvedValue(null);

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 3600000);
      const event = new ResourceUsageEndedEvent(999, 123, startTime, endTime);

      await service.handleResourceUsageEnded(event);

      expect(mockMqttClientService.publish).not.toHaveBeenCalled();
    });
  });
});
