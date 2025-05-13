import { Logger } from '@nestjs/common';
import { ReaderState } from './reader-state.interface';
import { GatewayServices } from '../websocket.gateway';
import { AuthenticatedWebSocket, FabreaderEventType } from '../websocket.types';
import { FabreaderEvent } from '../websocket.types';

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
    return new FabreaderEvent(FabreaderEventType.DISPLAY_ERROR, {
      message: `No Resources`,
      duration: 10000,
    });
  }
}
