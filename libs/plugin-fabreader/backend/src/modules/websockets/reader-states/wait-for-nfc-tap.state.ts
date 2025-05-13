import { Logger } from '@nestjs/common';
import { GatewayServices } from '../websocket.gateway';
import { AuthenticatedWebSocket, FabreaderEventType, FabreaderResponse } from '../websocket.types';
import { FabreaderEvent } from '../websocket.types';
import { InitialReaderState } from './initial.state';
import { ReaderState } from './reader-state.interface';
import { NFCCard } from '../../persistence/db/entities/nfcCard.entity';

export class WaitForNFCTapState implements ReaderState {
  private readonly logger = new Logger(WaitForNFCTapState.name);

  private timeout?: NodeJS.Timeout;

  private card?: NFCCard;

  public constructor(
    private readonly socket: AuthenticatedWebSocket,
    private readonly services: GatewayServices,
    private readonly selectedResourceId: number,
    private readonly timeout_ms = 0,
    private readonly timout_transition_state?: ReaderState,
    private readonly success_transition_state?: ReaderState
  ) {
    this.restartTimeout();
  }

  private restartTimeout() {
    if (!this.timeout_ms) {
      return;
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(async () => {
      this.logger.debug(
        `Reader has not tapped a card within ${this.timeout_ms}ms, moving to ${this.timout_transition_state?.constructor.name}`
      );

      this.sendDisableCardChecking();

      this.socket.state = this.timout_transition_state;
      const initMessage = await this.timout_transition_state.getInitMessage();
      console.log('initMessage', initMessage);
      this.socket.send(JSON.stringify(initMessage));
    }, this.timeout_ms);
  }

  public async onEvent(data: FabreaderEvent['data']) {
    if (data.type === FabreaderEventType.NFC_TAP) {
      this.restartTimeout();

      return this.onNFCTap(data);
    }

    return undefined;
  }

  public async onResponse(data: FabreaderResponse['data']) {
    if (data.type === FabreaderEventType.AUTHENTICATE) {
      this.restartTimeout();

      return await this.onAuthenticate(data);
    }

    return undefined;
  }

  public async getInitMessage(): Promise<FabreaderEvent> {
    const activeUsageSession = await this.services.dbService.getActiveResourceUsageSession(this.selectedResourceId);
    const resourceIsInUse = !!activeUsageSession;

    if (resourceIsInUse) {
      return new FabreaderEvent(FabreaderEventType.ENABLE_CARD_CHECKING, {
        message: `Tap to stop`,
      });
    }

    return new FabreaderEvent(FabreaderEventType.ENABLE_CARD_CHECKING, {
      message: `Tap to start`,
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
          duration: 10000,
        })
      )
    );

    return await this.getInitMessage();
  }

  private async onNFCTap(data: FabreaderEvent<{ cardUID: string }>['data']) {
    this.sendDisableCardChecking('Do not remove card!');
    await new Promise((resolve) => setTimeout(resolve, 200));

    const nfcCard = await this.services.dbService.getNFCCardByUID(data.payload.cardUID);

    if (!nfcCard) {
      this.logger.debug(`NFC Card with UID ${data.payload.cardUID} not found`);
      return this.onInvalidCard();
    }

    this.card = nfcCard;

    return new FabreaderEvent(FabreaderEventType.AUTHENTICATE, {
      authenticationKey: nfcCard.keys[0],
      keyNumber: 0,
    });
  }

  private async onAuthenticate(data: FabreaderEvent<{ cardUID: string }>['data']) {
    if (!this.card) {
      this.logger.error('No card attached to socket..');
      return;
    }

    const userOfNFCCard = await this.services.dbService.getUserById(this.card.userId);

    if (!userOfNFCCard) {
      this.logger.debug(`User (of NFC Card with UID ${data.payload.cardUID}) with ID ${this.card.userId} not found`);
      return this.onInvalidCard();
    }

    const activeUsageSession = await this.services.dbService.getActiveResourceUsageSession(this.selectedResourceId);

    const resourceIsInUse = !!activeUsageSession;

    let responseMessage = '-';
    if (resourceIsInUse) {
      responseMessage = 'Resource stopped';
      this.logger.debug(`Stopping resource usage for user ${userOfNFCCard.id} on resource ${this.selectedResourceId}`);
      await this.services.dbService.stopResourceUsage({
        resourceId: this.selectedResourceId,
        userId: userOfNFCCard.id,
        readerId: this.socket.reader.id,
        cardId: this.card.id,
      });
    } else {
      responseMessage = 'Resource started';
      this.logger.debug(`Starting resource usage for user ${userOfNFCCard.id} on resource ${this.selectedResourceId}`);
      await this.services.dbService.startResourceUsage({
        userId: userOfNFCCard.id,
        resourceId: this.selectedResourceId,
        readerId: this.socket.reader.id,
        cardId: this.card.id,
      });
    }

    this.restartTimeout();

    // wait 10 seconds
    this.socket.send(
      JSON.stringify(
        new FabreaderEvent(FabreaderEventType.DISPLAY_SUCCESS, {
          message: responseMessage,
          duration: 10000,
        })
      )
    );

    if (this.success_transition_state) {
      this.socket.state = this.success_transition_state;
      return await this.success_transition_state.getInitMessage();
    }

    return await this.getInitMessage();
  }
}
