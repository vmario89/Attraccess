import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayDisconnect,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { Inject, Logger } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { InitialReaderState } from './reader-states/initial.state';
import { EnrollNTAG424State } from './reader-states/enroll-ntag424.state';
import { AuthenticatedWebSocket, FabreaderEvent, FabreaderMessage } from './websocket.types';
import { FabreaderService } from '../../fabreader.service';
import { nanoid } from 'nanoid';
import { ResetNTAG424State } from './reader-states/reset-ntag424.state';
import { ReaderState } from './reader-states/reader-state.interface';
import { UsersService } from '../../../users-and-auth/users/users.service';
import { ResourcesService } from '../../../resources/resources.service';
import { ResourceUsageService } from '../../../resources/usage/resourceUsage.service';

export interface GatewayServices {
  websocketService: WebsocketService;
  fabreaderService: FabreaderService;
  resourcesService: ResourcesService;
  resourceUsageService: ResourceUsageService;
  usersService: UsersService;
}

@WebSocketGateway({ path: '/api/fabreader/websocket' })
export class FabreaderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private static readonly SOCKET_HEARTBEAT_TIMEOUT = 30000;

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FabreaderGateway.name);

  @Inject(WebsocketService)
  private websocketService: WebsocketService;

  @Inject(FabreaderService)
  private fabreaderService: FabreaderService;

  @Inject(UsersService)
  private usersService: UsersService;

  @Inject(ResourcesService)
  private resourcesService: ResourcesService;

  @Inject(ResourceUsageService)
  private resourceUsageService: ResourceUsageService;

  public async handleConnection(client: AuthenticatedWebSocket) {
    this.logger.log('Client connected via WebSocket');

    client.id = nanoid(5);

    client.transitionToState = async (state: ReaderState) => {
      if (client.state) {
        await client.state.onStateExit();
      }
      client.state = state;
      await client.state.onStateEnter();
    };

    client.sendMessage = (message: FabreaderMessage) => {
      this.logger.debug(`Sending ${message.event} of type ${message.data.type}`, message.data.payload);
      (client as unknown as WebSocket).send(JSON.stringify(message));
    };

    client.transitionToState(
      new InitialReaderState(client, {
        websocketService: this.websocketService,
        fabreaderService: this.fabreaderService,
        usersService: this.usersService,
        resourceUsageService: this.resourceUsageService,
        resourcesService: this.resourcesService,
      })
    );

    this.websocketService.sockets.set(client.id, client);

    await this.clientWasActive(client);
  }

  public handleDisconnect(client: AuthenticatedWebSocket) {
    this.logger.debug(`Client ${client.id} disconnected.`);

    const readerId = client.reader?.id;
    if (readerId) {
      this.logger.log(`Client for reader ${readerId} disconnected.`);
    } else {
      this.logger.log('An unidentified client disconnected.');
    }

    this.websocketService.sockets.delete(client.id);
  }

  private async clientWasActive(client: AuthenticatedWebSocket) {
    if (client.disconnectTimeout) {
      clearTimeout(client.disconnectTimeout);
    }

    client.disconnectTimeout = setTimeout(() => {
      this.logger.debug(
        `Client ${client.id} did not send heartbeat within ${FabreaderGateway.SOCKET_HEARTBEAT_TIMEOUT}ms. Closing connection.`
      );
      client.close();
      this.handleDisconnect(client);
    }, FabreaderGateway.SOCKET_HEARTBEAT_TIMEOUT);

    if (client.reader) {
      await this.fabreaderService.updateLastReaderConnection(client.reader.id);
    }
  }

  @SubscribeMessage('HEARTBEAT')
  public async onHeartbeat(@ConnectedSocket() client: AuthenticatedWebSocket) {
    this.logger.debug(`Heartbeat from client ${client.id}.`);

    await this.clientWasActive(client);
  }

  @SubscribeMessage('EVENT')
  public async onClientEvent(
    @MessageBody() eventData: FabreaderEvent['data'],
    @ConnectedSocket() client: AuthenticatedWebSocket
  ) {
    if (!client.state) {
      this.logger.error('Client has no state attached. Closing connection.');
      client.close();
      return;
    }

    this.logger.debug(`Received event from client ${client.id}: ${eventData}`);

    await this.clientWasActive(client);

    await client.state.onEvent(eventData);

    return undefined;
  }

  @SubscribeMessage('RESPONSE')
  public async onResponse(
    @MessageBody() responseData: FabreaderEvent['data'],
    @ConnectedSocket() client: AuthenticatedWebSocket
  ) {
    if (!client.state) {
      this.logger.error('Client has no state attached. Closing connection.');
      client.close();
      return;
    }

    this.logger.debug(`Received response from client ${client.id}: ${responseData}`);

    await this.clientWasActive(client);

    await client.state.onResponse(responseData);

    return undefined;
  }

  public async startEnrollOfNewNfcCard(data: { readerId: number; userId: number }) {
    const reader = await this.fabreaderService.findReaderById(data.readerId);

    if (!reader) {
      throw new Error(`Reader not found: ${data.readerId}`);
    }

    const user = await this.usersService.findOne({ id: data.userId });

    if (!user) {
      throw new Error(`User not found: ${data.userId}`);
    }

    const socket = Array.from(this.websocketService.sockets.values()).find(
      (socket) => socket.reader?.id === data.readerId
    );

    if (!socket) {
      throw new Error(`Reader not connected: ${data.readerId}`);
    }

    const nextState = new EnrollNTAG424State(
      socket,
      {
        websocketService: this.websocketService,
        fabreaderService: this.fabreaderService,
        usersService: this.usersService,
        resourceUsageService: this.resourceUsageService,
        resourcesService: this.resourcesService,
      },
      data.userId
    );

    await socket.transitionToState(nextState);
  }

  public async startResetOfNfcCard(data: { readerId: number; userId: number; cardId: number }) {
    const reader = await this.fabreaderService.findReaderById(data.readerId);

    if (!reader) {
      throw new Error(`Reader not found: ${data.readerId}`);
    }

    const user = await this.usersService.findOne({ id: data.userId });

    if (!user) {
      throw new Error(`User not found: ${data.userId}`);
    }

    const socket = Array.from(this.websocketService.sockets.values()).find(
      (socket) => socket.reader?.id === data.readerId
    );

    if (!socket) {
      throw new Error(`Reader not connected: ${data.readerId}`);
    }

    const nfcCard = await this.fabreaderService.getNFCCardByID(data.cardId);

    if (!nfcCard) {
      throw new Error(`NFC card not found: ${data.cardId}`);
    }

    const nextState = new ResetNTAG424State(
      socket,
      {
        websocketService: this.websocketService,
        fabreaderService: this.fabreaderService,
        usersService: this.usersService,
        resourceUsageService: this.resourceUsageService,
        resourcesService: this.resourcesService,
      },
      nfcCard.id
    );
    await socket.transitionToState(nextState);
  }

  public async restartReader(readerId: number) {
    this.logger.debug(`Restarting reader ${readerId}.`);
    const sockets = Array.from(this.websocketService.sockets.values()).filter(
      (socket) => socket.reader?.id === readerId
    );

    await Promise.all(
      sockets.map(async (socket) => {
        this.logger.debug(`Resetting client ${socket.id} for reader ${readerId}.`);

        const nextState = new InitialReaderState(socket, {
          websocketService: this.websocketService,
          fabreaderService: this.fabreaderService,
          usersService: this.usersService,
          resourceUsageService: this.resourceUsageService,
          resourcesService: this.resourcesService,
        });

        await socket.transitionToState(nextState);
      })
    );
  }
}
