import { Logger } from '@nestjs/common';
import { AuthenticatedWebSocket, FabreaderEvent, FabreaderEventType } from '../websocket.types';
import { FabreaderResponse } from '../websocket.types';
import { ReaderState } from './reader-state.interface';
import { WaitForNFCTapState } from './wait-for-nfc-tap.state';
import { Resource } from '@attraccess/database-entities';
import { GatewayServices } from '../websocket.gateway';

export class WaitForResourceSelectionState implements ReaderState {
  private readonly logger = new Logger(WaitForResourceSelectionState.name);

  public constructor(
    private readonly socket: AuthenticatedWebSocket,
    private readonly services: GatewayServices,
    private readonly transitionEventData: FabreaderEvent['data'],
    private readonly resourcesOfReader: Resource[]
  ) {}

  public getInitMessage() {
    return new FabreaderEvent(FabreaderEventType.PROMPT_SELECTION, {
      message: `Select a resource`,
      options: this.resourcesOfReader.map((resource) => ({
        label: resource.name,
        value: resource.id,
      })),
    });
  }

  public async onEvent(data: FabreaderEvent['data']) {
    return undefined;
  }

  public async onResponse(data: FabreaderResponse<{ selection: number }>['data']) {
    if (data.type !== FabreaderEventType.PROMPT_SELECTION) {
      return undefined;
    }

    const selectedResourceId = data.payload.selection;
    if (typeof selectedResourceId !== 'number') {
      this.logger.error('Selected resource id is not a number, closing connection');
      this.socket.close();
      return undefined;
    }

    this.logger.debug(`Reader has selected resource with id ${selectedResourceId}, moving to WaitForNFCTapState`);
    this.socket.state = new WaitForNFCTapState(this.socket, this.services, selectedResourceId);
    return this.socket.state.getInitMessage();
  }
}
