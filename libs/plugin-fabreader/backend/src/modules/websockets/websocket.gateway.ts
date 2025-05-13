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
import { DbService } from '../persistence/db.service';
import { WebsocketService } from './websocket.service';
import { InitialReaderState } from './reader-states/initial.state';
import { EnrollNTAG424State } from './reader-states/enroll-ntag424.state';
import { AuthenticatedWebSocket, FabreaderEvent } from './websocket.types';
import { FabreaderService } from '../../fabreader.service';
import { nanoid } from 'nanoid';
import { ResetNTAG424State } from './reader-states/reset-ntag424.state';

export interface GatewayServices {
  dbService: DbService;
  websocketService: WebsocketService;
  fabreaderService: FabreaderService;
}

@WebSocketGateway({ path: '/api/fabreader/websocket' })
export class FabreaderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private static readonly SOCKET_HEARTBEAT_TIMEOUT = 30000;

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FabreaderGateway.name);

  @Inject(DbService)
  private dbService: DbService;

  @Inject(WebsocketService)
  private websocketService: WebsocketService;

  @Inject(FabreaderService)
  private fabreaderService: FabreaderService;

  public async handleConnection(client: AuthenticatedWebSocket) {
    this.logger.log('Client connected via WebSocket');

    client.id = nanoid(5);

    client.state = new InitialReaderState(client, {
      dbService: this.dbService,
      websocketService: this.websocketService,
      fabreaderService: this.fabreaderService,
    });
    client.send(JSON.stringify(await client.state.getInitMessage()));

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
      await this.dbService.updateLastReaderConnection(client.reader.id);
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

    await this.clientWasActive(client);

    const response = await client.state.onEvent(eventData);

    this.logger.debug(
      `Processed event ${eventData.type} with payload ${JSON.stringify(
        eventData.payload
      )}, sending response: ${JSON.stringify(response)}`
    );

    return response;
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

    await this.clientWasActive(client);

    const response = await client.state.onResponse(responseData);

    this.logger.debug(
      `Processed response ${responseData.type} with payload ${JSON.stringify(
        responseData.payload
      )}, sending response: ${JSON.stringify(response)}`
    );

    return response;
  }

  public async startEnrollOfNewNfcCard(data: { readerId: number; userId: number }) {
    const reader = await this.dbService.findReaderById(data.readerId);

    if (!reader) {
      throw new Error(`Reader not found: ${data.readerId}`);
    }

    const user = await this.dbService.getUserById(data.userId);

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
        dbService: this.dbService,
        websocketService: this.websocketService,
        fabreaderService: this.fabreaderService,
      },
      data.userId
    );
    socket.state = nextState;
    const initMessage = await nextState.getInitMessage();
    this.logger.debug(`Sending enrollment init message: ${JSON.stringify(initMessage)}`);
    socket.send(JSON.stringify(initMessage));
  }

  public async startResetOfNfcCard(data: { readerId: number; userId: number; cardId: number }) {
    const reader = await this.dbService.findReaderById(data.readerId);

    if (!reader) {
      throw new Error(`Reader not found: ${data.readerId}`);
    }

    const user = await this.dbService.getUserById(data.userId);

    if (!user) {
      throw new Error(`User not found: ${data.userId}`);
    }

    const socket = Array.from(this.websocketService.sockets.values()).find(
      (socket) => socket.reader?.id === data.readerId
    );

    if (!socket) {
      throw new Error(`Reader not connected: ${data.readerId}`);
    }

    const nfcCard = await this.dbService.getNFCCardByID(data.cardId);

    if (!nfcCard) {
      throw new Error(`NFC card not found: ${data.cardId}`);
    }

    const nextState = new ResetNTAG424State(
      socket,
      {
        dbService: this.dbService,
        websocketService: this.websocketService,
        fabreaderService: this.fabreaderService,
      },
      nfcCard.id
    );
    socket.state = nextState;
    const initMessage = await nextState.getInitMessage();
    this.logger.debug(`Sending reset init message: ${JSON.stringify(initMessage)}`);
    socket.send(JSON.stringify(initMessage));
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
          dbService: this.dbService,
          websocketService: this.websocketService,
          fabreaderService: this.fabreaderService,
        });
        socket.state = nextState;
        const initMessage = await nextState.getInitMessage(true);
        this.logger.debug(`Sending init message: ${JSON.stringify(initMessage)}`);
        socket.send(JSON.stringify(initMessage));

        socket.addEventListener('error', (event) => {
          this.logger.error(`Error on client ${socket.id}: ${event}`);
        });
      })
    );
  }
}
