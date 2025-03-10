import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MqttServer } from '@attraccess/database-entities';
import { MqttServerService } from './mqtt-server.service';
import {
  CreateMqttServerDto,
  UpdateMqttServerDto,
  TestConnectionResponseDto,
  MqttServerStatusDto,
  AllMqttServerStatusesDto,
} from './dtos/mqtt-server.dto';
import {
  Auth,
  SystemPermission,
} from '../../users-and-auth/strategies/systemPermissions.guard';
import { MqttClientService } from '../mqtt-client.service';

@ApiTags('MQTT Servers')
@Auth(SystemPermission.canManageResources)
@Controller('mqtt/servers')
export class MqttServerController {
  constructor(
    private readonly mqttServerService: MqttServerService,
    private readonly mqttClientService: MqttClientService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all MQTT servers' })
  @ApiResponse({
    status: 200,
    description: 'Returns all MQTT servers',
    type: [MqttServer],
  })
  async getMqttServers(): Promise<MqttServer[]> {
    return this.mqttServerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get MQTT server by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the MQTT server with the specified ID',
    type: MqttServer,
  })
  @ApiResponse({ status: 404, description: 'MQTT server not found' })
  async getMqttServerById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<MqttServer> {
    return this.mqttServerService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new MQTT server' })
  @ApiResponse({
    status: 201,
    description: 'MQTT server created successfully',
    type: MqttServer,
  })
  async createMqttServer(
    @Body() createMqttServerDto: CreateMqttServerDto
  ): Promise<MqttServer> {
    return this.mqttServerService.create(createMqttServerDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update MQTT server' })
  @ApiResponse({
    status: 200,
    description: 'MQTT server updated successfully',
    type: MqttServer,
  })
  @ApiResponse({ status: 404, description: 'MQTT server not found' })
  async updateMqttServer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMqttServerDto: UpdateMqttServerDto
  ): Promise<MqttServer> {
    return this.mqttServerService.update(id, updateMqttServerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete MQTT server' })
  @ApiResponse({ status: 200, description: 'MQTT server deleted successfully' })
  @ApiResponse({ status: 404, description: 'MQTT server not found' })
  async deleteMqttServer(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mqttServerService.remove(id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test MQTT server connection' })
  @ApiResponse({
    status: 200,
    description: 'Connection test result',
    type: TestConnectionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'MQTT server not found' })
  async testMqttServerConnection(
    @Param('id', ParseIntPipe) id: number
  ): Promise<TestConnectionResponseDto> {
    try {
      // First check if the server exists
      await this.mqttServerService.findOne(id);

      // Use the MQTT client service to test the connection
      const result = await this.mqttClientService.testConnection(id);

      // Ensure we always return a properly formatted response
      return {
        success: typeof result.success === 'boolean' ? result.success : false,
        message:
          result.message ||
          (result.success ? 'Connection successful' : 'Connection failed'),
      };
    } catch (error) {
      // If any exception occurs, return a formatted error
      return {
        success: false,
        message: `Connection failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get MQTT server connection status and statistics' })
  @ApiResponse({
    status: 200,
    description: 'MQTT server connection status and statistics',
    type: MqttServerStatusDto,
  })
  @ApiResponse({ status: 404, description: 'MQTT server not found' })
  async getServerStatus(
    @Param('id', ParseIntPipe) id: number
  ): Promise<MqttServerStatusDto> {
    return this.mqttClientService.getServerStatus(id);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get all MQTT server connection statuses and statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'All MQTT server connection statuses and statistics',
    type: AllMqttServerStatusesDto,
  })
  async getAllServerStatuses(): Promise<Record<string, MqttServerStatusDto>> {
    return this.mqttClientService.getAllServerStatuses();
  }
}
