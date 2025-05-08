import { Logger } from '@nestjs/common';
import { ReaderState } from './reader-state.interface';
import { InitialReaderState } from './initial.state';
import { AuthenticatedWebSocket, FabreaderEvent, FabreaderEventType, FabreaderResponse } from '../websocket.types';
import { GatewayServices } from '../websocket.gateway';
import { NFCCard } from '../../persistence/db/entities/nfcCard.entity';

export class ResetNTAG424State implements ReaderState {
  private readonly logger = new Logger(ResetNTAG424State.name);
  private card: NFCCard | null = null;

  // key numbers
  public readonly KEY_ZERO_MASTER = 0;

  // 16 bytes of 0 as Uint8Array
  public readonly DEFAULT_NTAG424_KEYS = {
    [this.KEY_ZERO_MASTER]: new Uint8Array(16).fill(0),
  };

  constructor(
    private readonly socket: AuthenticatedWebSocket,
    private readonly services: GatewayServices,
    private readonly cardId: NFCCard['id']
  ) {}

  public async onEvent(eventData: FabreaderEvent['data']) {
    if (eventData.type === FabreaderEventType.NFC_TAP) {
      return this.onGetNfcUID(eventData);
    }

    this.logger.warn(`Unexpected event type ${eventData.type}`);

    return undefined;
  }

  public async onResponse(responseData: FabreaderResponse['data']) {
    if (responseData.type === FabreaderEventType.CHANGE_KEYS) {
      return await this.onKeysChanged(responseData);
    }

    this.logger.warn(`Unexpected response type ${responseData.type} `);

    return undefined;
  }

  private async onGetNfcUID(responseData: FabreaderResponse['data']) {
    this.socket.send(JSON.stringify(new FabreaderEvent(FabreaderEventType.DISABLE_CARD_CHECKING)));

    const cardUID = responseData.payload.cardUID;
    if (cardUID !== this.card?.uid) {
      this.logger.warn(`Unexpected card UID ${cardUID}, ignoring`);
      return undefined;
    }

    const nfcCard = await this.services.dbService.getNFCCardByUID(cardUID);

    const masterKey: string =
      nfcCard?.keys[this.KEY_ZERO_MASTER] ??
      this.services.fabreaderService.uint8ArrayToHexString(this.DEFAULT_NTAG424_KEYS[this.KEY_ZERO_MASTER]);

    const newKeys = {
      [this.KEY_ZERO_MASTER]: this.services.fabreaderService.uint8ArrayToHexString(
        this.DEFAULT_NTAG424_KEYS[this.KEY_ZERO_MASTER]
      ),
    };

    this.logger.debug('Sending ChangeKeys event', {
      authenticationKey: masterKey,
      keys: newKeys,
    });

    return new FabreaderEvent(FabreaderEventType.CHANGE_KEYS, {
      authenticationKey: masterKey,
      keys: newKeys,
    });
  }

  private async onKeysChanged(responseData: FabreaderResponse['data']) {
    const failedKeys = responseData.payload.failedKeys as number[];
    const successfulKeys = responseData.payload.successfulKeys as number[];

    if (successfulKeys?.length !== 1 || failedKeys?.length > 0) {
      this.logger.error(
        `Keys ${failedKeys?.join(', ')} failed to change, Keys ${successfulKeys?.join(', ')} changed successfully`
      );

      const nextState = new InitialReaderState(this.socket, this.services);
      this.socket.state = nextState;
      return await nextState.getInitMessage();
    }

    await this.services.dbService.deleteNFCCard(this.cardId);

    this.socket.send(
      JSON.stringify(
        new FabreaderEvent(FabreaderEventType.DISPLAY_SUCCESS, {
          message: 'Reset successful',
        })
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const initialState = new InitialReaderState(this.socket, this.services);
    this.socket.state = initialState;
    return await initialState.getInitMessage();
  }

  public async getInitMessage(): Promise<FabreaderEvent> {
    this.card = await this.services.dbService.getNFCCardByID(this.cardId);

    if (!this.card) {
      throw new Error(`Card not found: ${this.cardId}`);
    }

    return new FabreaderEvent(FabreaderEventType.ENABLE_CARD_CHECKING, {
      displayText: 'Tap your NFC card to reset it',
    });
  }
}
