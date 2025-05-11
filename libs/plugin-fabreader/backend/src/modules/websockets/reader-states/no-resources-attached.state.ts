import { Logger } from '@nestjs/common';
import { ReaderState } from './reader-state.interface';
import { GatewayServices } from '../websocket.gateway';
import { AuthenticatedWebSocket, FabreaderEventType } from '../websocket.types';
import { FabreaderEvent } from '../websocket.types';
import { InitialReaderState } from './initial.state';

export class NoResourcesAttachedState implements ReaderState {
  private readonly logger = new Logger(NoResourcesAttachedState.name);

  public constructor(private readonly socket: AuthenticatedWebSocket, private readonly services: GatewayServices) {}

  public async onEvent(/* data: FabreaderEvent['data'] */) {
    return undefined;
  }

  public async onResponse(/* data: FabreaderResponse['data'] */) {
    return undefined;
  }

  public async getInitMessage(): Promise<FabreaderEvent> {
    const errorState = new FabreaderEvent(FabreaderEventType.DISPLAY_ERROR, {
      message: `No Resources (ID: ${this.socket.reader?.name ?? this.socket.reader?.id})`,
      duration: 10000,
    });

    this.socket.send(JSON.stringify(errorState));

    const nextState = new InitialReaderState(this.socket, this.services);
    this.socket.state = nextState;
    return await nextState.getInitMessage();
  }
}
