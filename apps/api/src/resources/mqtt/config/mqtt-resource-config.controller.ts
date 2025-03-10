import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MqttResourceConfig } from '@attraccess/database-entities';
import { MqttResourceConfigService } from './mqtt-resource-config.service';
import {
  CreateMqttResourceConfigDto,
  TestMqttConfigResponseDto,
} from './dtos/mqtt-resource-config.dto';
import {
  Auth,
  SystemPermission,
} from '../../../users-and-auth/strategies/systemPermissions.guard';
import { MqttClientService } from '../../../mqtt/mqtt-client.service';
import * as Handlebars from 'handlebars';

@ApiTags('MQTT Resource Configuration')
@Auth(SystemPermission.canManageResources)
@Controller('resources/:resourceId/mqtt/config')
export class MqttResourceConfigController {
  constructor(
    private readonly mqttResourceConfigService: MqttResourceConfigService,
    private readonly mqttClientService: MqttClientService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get MQTT configuration for a resource' })
  @ApiResponse({
    status: 200,
    description: 'Returns the MQTT configuration for the resource',
    type: MqttResourceConfig,
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getMqttConfig(
    @Param('resourceId', ParseIntPipe) resourceId: number
  ): Promise<MqttResourceConfig | null> {
    return this.mqttResourceConfigService.findByResourceId(resourceId);
  }

  @Post()
  @ApiOperation({
    summary: 'Create or update MQTT configuration for a resource',
  })
  @ApiResponse({
    status: 201,
    description: 'MQTT configuration created or updated successfully',
    type: MqttResourceConfig,
  })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async createOrUpdateMqttConfig(
    @Param('resourceId', ParseIntPipe) resourceId: number,
    @Body() mqttConfigDto: CreateMqttResourceConfigDto
  ): Promise<MqttResourceConfig> {
    return this.mqttResourceConfigService.createOrUpdate(
      resourceId,
      mqttConfigDto
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Delete MQTT configuration for a resource' })
  @ApiResponse({
    status: 200,
    description: 'MQTT configuration deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Resource or MQTT configuration not found',
  })
  async deleteMqttConfig(
    @Param('resourceId', ParseIntPipe) resourceId: number
  ): Promise<void> {
    return this.mqttResourceConfigService.remove(resourceId);
  }

  @Post('test')
  @ApiOperation({ summary: 'Test MQTT configuration' })
  @ApiResponse({
    status: 200,
    description: 'Test result',
    type: TestMqttConfigResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Resource or MQTT configuration not found',
  })
  async testMqttConfig(
    @Param('resourceId', ParseIntPipe) resourceId: number
  ): Promise<TestMqttConfigResponseDto> {
    // Get the MQTT configuration for this resource
    const config = await this.mqttResourceConfigService.findByResourceId(
      resourceId
    );

    if (!config) {
      return {
        success: false,
        message: 'No MQTT configuration found for this resource',
      };
    }

    try {
      // Test the connection to the MQTT server
      const connectionResult = await this.mqttClientService.testConnection(
        config.serverId
      );

      if (!connectionResult.success) {
        return connectionResult;
      }

      // If connection is successful, validate the templates
      try {
        Handlebars.compile(config.inUseTopic);
        Handlebars.compile(config.inUseMessage);
        Handlebars.compile(config.notInUseTopic);
        Handlebars.compile(config.notInUseMessage);

        return {
          success: true,
          message:
            'MQTT configuration is valid and connection to server was successful',
        };
      } catch (error) {
        return {
          success: false,
          message: `Template validation failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to test MQTT configuration: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}
