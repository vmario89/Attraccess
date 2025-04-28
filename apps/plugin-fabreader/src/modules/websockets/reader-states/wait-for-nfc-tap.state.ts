import { GatewayServices } from '../websocket.gateway';
import { AuthenticatedWebSocket, FabreaderEventType, FabreaderResponse } from '../websocket.types';
import { FabreaderEvent } from '../websocket.types';
import { InitialReaderState } from './initial.state';
import { ReaderState } from './reader-state.interface';

export class WaitForNFCTapState implements ReaderState {
  private resourceIsInUse: boolean;

  public constructor(
    private readonly socket: AuthenticatedWebSocket,
    private readonly services: GatewayServices,
    private readonly selectedResourceId: number
  ) {}

  public async onEvent(data: FabreaderEvent['data']) {
    if (data.type === FabreaderEventType.NFC_TAP) {
      return this.onNFCTap(data);
    }

    return undefined;
  }

  public async onResponse(data: FabreaderResponse['data']) {
    return undefined;
  }

  public async getInitMessage(): Promise<FabreaderEvent> {
    const activeUsageSession = await this.services.dbService.getActiveResourceUsageSession(this.selectedResourceId);
    this.resourceIsInUse = !!activeUsageSession;

    if (this.resourceIsInUse) {
      return new FabreaderEvent(FabreaderEventType.DISPLAY_TEXT, {
        message: `Tap your card to stop`,
      });
    }

    return new FabreaderEvent(FabreaderEventType.DISPLAY_TEXT, {
      message: `Tap your card to start`,
    });
  }

  private async onInvalidCard() {
    this.socket.send(
      JSON.stringify(
        new FabreaderEvent(FabreaderEventType.DISPLAY_TEXT, {
          message: `Invalid card`,
        })
      )
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return this.getInitMessage();
  }

  private async onNFCTap(data: FabreaderEvent<{ cardUID: string }>['data']) {
    const nfcCard = await this.services.dbService.getNFCCardByUID(data.payload.cardUID);

    if (!nfcCard) {
      return this.onInvalidCard();
    }

    const userOfNFCCard = await this.services.dbService.getUserById(nfcCard.userId);

    if (!userOfNFCCard) {
      return this.onInvalidCard();
    }

    // TODO: run actual auth

    if (this.resourceIsInUse) {
      await this.services.dbService.stopResourceUsage({
        resourceId: this.selectedResourceId,
        userId: userOfNFCCard.id,
      });
    } else {
      await this.services.dbService.startResourceUsage({
        userId: userOfNFCCard.id,
        resourceId: this.selectedResourceId,
      });
    }

    if (this.socket.reader.hasAccessToResourceIds.length > 1) {
      const nextState = new InitialReaderState(this.socket, this.services);
      this.socket.state = nextState;
      return nextState.getInitMessage();
    }

    return await this.getInitMessage();
  }
}
