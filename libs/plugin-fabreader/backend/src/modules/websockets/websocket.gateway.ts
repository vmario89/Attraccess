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

export interface GatewayServices {
  dbService: DbService;
  websocketService: WebsocketService;
  fabreaderService: FabreaderService;
}

@WebSocketGateway({ path: '/api/fabreader/websocket' })
export class FabreaderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FabreaderGateway.name);

  @Inject(DbService)
  private dbService: DbService;

  @Inject(WebsocketService)
  private websocketService: WebsocketService;

  @Inject(FabreaderService)
  private fabreaderService: FabreaderService;

  public handleConnection(client: AuthenticatedWebSocket) {
    this.logger.log('Client connected via WebSocket');

    client.state = new InitialReaderState(client, {
      dbService: this.dbService,
      websocketService: this.websocketService,
      fabreaderService: this.fabreaderService,
    });
    client.send(JSON.stringify(client.state.getInitMessage()));

    this.websocketService.sockets.push(client);
  }

  public handleDisconnect(client: AuthenticatedWebSocket) {
    const readerId = client.reader?.id;
    if (readerId) {
      this.websocketService.sockets.splice(this.websocketService.sockets.indexOf(client), 1);
      this.logger.log(`Client for reader ${readerId} disconnected.`);
    } else {
      this.logger.log('An unidentified client disconnected.');
    }
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

    const socket = this.websocketService.sockets.find((socket) => socket.reader?.id === data.readerId);

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
    const initMessage = nextState.getInitMessage();
    this.logger.debug(`Sending enrollment init message: ${JSON.stringify(initMessage)}`);
    socket.send(JSON.stringify(initMessage));
  }
}
