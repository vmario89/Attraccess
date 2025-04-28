import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MqttResourceConfig, Resource } from '@attraccess/database-entities';
import { CreateMqttResourceConfigDto } from './dtos/mqtt-resource-config.dto';

@Injectable()
export class MqttResourceConfigService {
  constructor(
    @InjectRepository(MqttResourceConfig)
    private readonly mqttResourceConfigRepository: Repository<MqttResourceConfig>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>
  ) {}

  /**
   * Get MQTT configuration for a resource
   */
  async findByResourceId(resourceId: number): Promise<MqttResourceConfig | null> {
    // First check if the resource exists
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId },
    });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    // Find the MQTT config for this resource
    return this.mqttResourceConfigRepository.findOne({
      where: { resourceId },
      relations: ['server'],
    });
  }

  /**
   * Create or update MQTT configuration for a resource
   */
  async createOrUpdate(resourceId: number, dto: CreateMqttResourceConfigDto): Promise<MqttResourceConfig> {
    // First check if the resource exists
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId },
    });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    // Check if a config already exists for this resource
    const existingConfig = await this.mqttResourceConfigRepository.findOne({
      where: { resourceId },
    });

    if (existingConfig) {
      // Update existing config
      Object.assign(existingConfig, dto);
      return this.mqttResourceConfigRepository.save(existingConfig);
    } else {
      // Create new config
      const newConfig = this.mqttResourceConfigRepository.create({
        resourceId,
        ...dto,
      });
      return this.mqttResourceConfigRepository.save(newConfig);
    }
  }

  /**
   * Delete MQTT configuration for a resource
   */
  async remove(resourceId: number): Promise<void> {
    // First check if the resource exists
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceId },
    });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    // Find the config
    const config = await this.mqttResourceConfigRepository.findOne({
      where: { resourceId },
    });

    if (!config) {
      throw new NotFoundException(`MQTT configuration for resource with ID ${resourceId} not found`);
    }

    // Remove the config
    await this.mqttResourceConfigRepository.remove(config);
  }
}
