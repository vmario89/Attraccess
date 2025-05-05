import { Logger } from '@nestjs/common';
import { GatewayServices } from '../websocket.gateway';
import { AuthenticatedWebSocket, FabreaderEventType, FabreaderResponse } from '../websocket.types';
import { FabreaderEvent } from '../websocket.types';
import { InitialReaderState } from './initial.state';
import { ReaderState } from './reader-state.interface';
import { NFCCard } from '../../persistence/db/entities/nfcCard.entity';

interface SocketWithData extends AuthenticatedWebSocket {
  card?: NFCCard;
}

export class WaitForNFCTapState implements ReaderState {
  private readonly logger = new Logger(WaitForNFCTapState.name);

  public constructor(
    private readonly socket: SocketWithData,
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
    if (data.type === FabreaderEventType.AUTHENTICATE) {
      return await this.onAuthenticate(data);
    }

    return undefined;
  }

  public async getInitMessage(): Promise<FabreaderEvent> {
    const activeUsageSession = await this.services.dbService.getActiveResourceUsageSession(this.selectedResourceId);
    const resourceIsInUse = !!activeUsageSession;

    if (resourceIsInUse) {
      return new FabreaderEvent(FabreaderEventType.ENABLE_CARD_CHECKING, {
        message: `Tap your card to stop`,
      });
    }

    return new FabreaderEvent(FabreaderEventType.ENABLE_CARD_CHECKING, {
      message: `Tap your card to start`,
    });
  }

  private sendDisableCardChecking(textToDisplay?: string) {
    this.socket.send(
      JSON.stringify(
        new FabreaderEvent(FabreaderEventType.DISABLE_CARD_CHECKING, {
          message: textToDisplay,
        })
      )
    );
  }

  private async onInvalidCard() {
    this.sendDisableCardChecking();

    await new Promise((resolve) => setTimeout(resolve, 200));

    this.socket.send(
      JSON.stringify(
        new FabreaderEvent(FabreaderEventType.DISPLAY_ERROR, {
          message: `Invalid card`,
        })
      )
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return await this.getInitMessage();
  }

  private async onNFCTap(data: FabreaderEvent<{ cardUID: string }>['data']) {
    this.sendDisableCardChecking('Do not remove card!');

    const nfcCard = await this.services.dbService.getNFCCardByUID(data.payload.cardUID);

    if (!nfcCard) {
      this.logger.debug(`NFC Card with UID ${data.payload.cardUID} not found`);
      return this.onInvalidCard();
    }

    this.socket.card = nfcCard;

    return new FabreaderEvent(FabreaderEventType.AUTHENTICATE, {
      authenticationKey: nfcCard.keys[0],
      keyNumber: 0,
    });
  }

  private async onAuthenticate(data: FabreaderEvent<{ cardUID: string }>['data']) {
    if (!this.socket.card) {
      this.logger.error('No card attached to socket..');
      return;
    }

    const userOfNFCCard = await this.services.dbService.getUserById(this.socket.card.userId);

    if (!userOfNFCCard) {
      this.logger.debug(
        `User (of NFC Card with UID ${data.payload.cardUID}) with ID ${this.socket.card.userId} not found`
      );
      return this.onInvalidCard();
    }

    const activeUsageSession = await this.services.dbService.getActiveResourceUsageSession(this.selectedResourceId);

    const resourceIsInUse = !!activeUsageSession;

    if (resourceIsInUse) {
      this.logger.debug(`Stopping resource usage for user ${userOfNFCCard.id} on resource ${this.selectedResourceId}`);
      await this.services.dbService.stopResourceUsage({
        resourceId: this.selectedResourceId,
        userId: userOfNFCCard.id,
        readerId: this.socket.reader.id,
        cardId: this.socket.card.id,
      });
    } else {
      this.logger.debug(`Starting resource usage for user ${userOfNFCCard.id} on resource ${this.selectedResourceId}`);
      await this.services.dbService.startResourceUsage({
        userId: userOfNFCCard.id,
        resourceId: this.selectedResourceId,
        readerId: this.socket.reader.id,
        cardId: this.socket.card.id,
      });
    }

    if (this.socket.reader.hasAccessToResourceIds.length > 1) {
      const nextState = new InitialReaderState(this.socket, this.services);
      this.socket.state = nextState;
      return await nextState.getInitMessage();
    }

    return await this.getInitMessage();
  }
}
