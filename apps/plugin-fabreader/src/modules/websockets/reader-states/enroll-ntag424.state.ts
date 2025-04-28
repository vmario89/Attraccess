import { Logger } from '@nestjs/common';
import { ReaderState } from './reader-state.interface';
import { InitialReaderState } from './initial.state';
import { randomBytes, subtle } from 'crypto';
import { User } from '@attraccess/plugins';
import { AuthenticatedWebSocket, FabreaderEvent, FabreaderEventType, FabreaderResponse } from '../websocket.types';
import { GatewayServices } from '../websocket.gateway';
import { NFCCard } from '../../persistence/db/entities/nfcCard.entity';

export interface EnrollmentState {
  lastSendEvent: FabreaderEventType;
  cardUID?: string;
  data: {
    newKeys?: Record<number, Uint8Array>;
    verificationToken?: Uint8Array;
    antiDuplicationToken?: Uint8Array;
  };
}

export class EnrollNTAG424State implements ReaderState {
  private readonly logger = new Logger(EnrollNTAG424State.name);

  // key numbers
  public readonly KEY_ZERO_MASTER = 0;
  public readonly KEY_ONE_APP_AUTH = 1;
  public readonly KEY_TWO_APP_READ = 2;
  public readonly KEY_THREE_APP_WRITE = 3;
  public readonly KEY_FOUR_APP_READ_WRITE = 4;

  // 16 bytes of 0 as Uint8Array
  public readonly DEFAULT_NTAG424_KEYS = {
    [this.KEY_ZERO_MASTER]: new Uint8Array(16).fill(0),
    [this.KEY_ONE_APP_AUTH]: new Uint8Array(16).fill(0),
    [this.KEY_TWO_APP_READ]: new Uint8Array(16).fill(0),
    [this.KEY_THREE_APP_WRITE]: new Uint8Array(16).fill(0),
    [this.KEY_FOUR_APP_READ_WRITE]: new Uint8Array(16).fill(0),
  };

  public readonly VERIFICATION_TOKEN_FILE_ID = 0x00;
  public readonly ANTI_DUPLICATION_TOKEN_FILE_ID = 0x01;

  constructor(
    private readonly socket: AuthenticatedWebSocket & { enrollment?: EnrollmentState },
    private readonly services: GatewayServices,
    private readonly userId: User['id']
  ) {}

  public async onEvent(eventData: FabreaderEvent['data']) {
    if (eventData.type === FabreaderEventType.NFC_REMOVED) {
      return this.onNfcRemoved();
    }

    return undefined;
  }

  public async onResponse(responseData: FabreaderResponse['data']) {
    if (this.socket.enrollment?.lastSendEvent !== responseData.type) {
      this.logger.warn(
        `Unexpected response type ${responseData.type} in state ${this.socket.enrollment?.lastSendEvent}`
      );
      return undefined;
    }

    if (responseData.type === FabreaderEventType.GET_NFC_UID) {
      return this.onGetNfcUID(responseData);
    }

    if (responseData.type === FabreaderEventType.CHANGE_KEYS) {
      return this.onKeysChanged(responseData);
    }

    if (responseData.type === FabreaderEventType.WRITE_FILES) {
      return this.onWriteFiles(responseData);
    }

    return undefined;
  }

  /**
   * Generates a new key for the NFC card based on a seed which is based on the current month,
   * the keyNo and the cardUID.
   * @param keyNo The key number to generate
   * @param cardUID The UID of the NFC card
   * @returns 16 bytes Uint8Array
   */
  private async generateNTAG424Key(data: { keyNo: number; cardUID: string }) {
    const seed = `${new Date().getMonth()}${data.keyNo}${data.cardUID}`;
    const seedBytes = new TextEncoder().encode(seed);
    const key = await subtle.digest('SHA-256', seedBytes);
    return new Uint8Array(key).slice(0, 16);
  }

  private async generateRandomVerificationToken() {
    const seed = randomBytes(32);
    const key = await subtle.digest('SHA-256', seed);
    return new Uint8Array(key).slice(0, 16);
  }

  public uint8ArrayToHexString(uint8Array: Uint8Array) {
    return Array.from(uint8Array)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  public hexStringToUint8Array(hexString: string) {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
    }
    return bytes;
  }

  private async onGetNfcUID(responseData: FabreaderResponse['data']) {
    const cardUID = responseData.payload.cardUID;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.socket.enrollment!.cardUID = cardUID;

    const nfcCard = await this.services.dbService.getNFCCardByUID(cardUID);

    const masterKey = nfcCard?.keys[this.KEY_ZERO_MASTER] ?? this.DEFAULT_NTAG424_KEYS[this.KEY_ZERO_MASTER];

    this.socket.enrollment.data.newKeys = {
      [this.KEY_ZERO_MASTER]: await this.generateNTAG424Key({
        keyNo: this.KEY_ZERO_MASTER,
        cardUID,
      }),
      [this.KEY_ONE_APP_AUTH]: await this.generateNTAG424Key({
        keyNo: this.KEY_ONE_APP_AUTH,
        cardUID,
      }),
      [this.KEY_TWO_APP_READ]: await this.generateNTAG424Key({
        keyNo: this.KEY_TWO_APP_READ,
        cardUID,
      }),
      [this.KEY_THREE_APP_WRITE]: await this.generateNTAG424Key({
        keyNo: this.KEY_THREE_APP_WRITE,
        cardUID,
      }),
      [this.KEY_FOUR_APP_READ_WRITE]: await this.generateNTAG424Key({
        keyNo: this.KEY_FOUR_APP_READ_WRITE,
        cardUID,
      }),
    };

    this.socket.enrollment.lastSendEvent = FabreaderEventType.CHANGE_KEYS;
    return new FabreaderEvent(FabreaderEventType.CHANGE_KEYS, {
      authenticationKey: masterKey,
      keys: this.socket.enrollment.data.newKeys,
    });
  }

  private async onKeysChanged(responseData: FabreaderResponse['data']) {
    if (!responseData.payload.success) {
      this.logger.error('Failed to change keys', {
        error: responseData.payload.error,
        enrollmentState: this.socket.enrollment,
      });
      this.socket.enrollment = undefined;
      const nextState = new InitialReaderState(this.socket, this.services);
      return nextState.getInitMessage();
    }

    this.socket.enrollment.data.verificationToken = await this.generateRandomVerificationToken();
    this.socket.enrollment.data.antiDuplicationToken = await this.generateRandomVerificationToken();
    this.socket.enrollment.lastSendEvent = FabreaderEventType.WRITE_FILES;

    return new FabreaderEvent(FabreaderEventType.WRITE_FILES, {
      [this.VERIFICATION_TOKEN_FILE_ID]: this.socket.enrollment.data.verificationToken,
      [this.ANTI_DUPLICATION_TOKEN_FILE_ID]: this.socket.enrollment.data.antiDuplicationToken,
    });
  }

  private async onWriteFiles(responseData: FabreaderResponse['data']) {
    if (!responseData.payload.success) {
      this.logger.error(
        'Failed to write files',
        JSON.stringify({
          error: responseData.payload.error,
          enrollmentState: this.socket.enrollment,
        })
      );
      this.socket.enrollment = undefined;
      const nextState = new InitialReaderState(this.socket, this.services);
      return nextState.getInitMessage();
    }

    await this.services.dbService.createNFCCard({
      uid: this.socket.enrollment.cardUID,
      keys: {
        [this.KEY_ZERO_MASTER]: this.uint8ArrayToHexString(this.socket.enrollment.data.newKeys[this.KEY_ZERO_MASTER]),
        [this.KEY_ONE_APP_AUTH]: this.uint8ArrayToHexString(this.socket.enrollment.data.newKeys[this.KEY_ONE_APP_AUTH]),
        [this.KEY_TWO_APP_READ]: this.uint8ArrayToHexString(this.socket.enrollment.data.newKeys[this.KEY_TWO_APP_READ]),
        [this.KEY_THREE_APP_WRITE]: this.uint8ArrayToHexString(
          this.socket.enrollment.data.newKeys[this.KEY_THREE_APP_WRITE]
        ),
        [this.KEY_FOUR_APP_READ_WRITE]: this.uint8ArrayToHexString(
          this.socket.enrollment.data.newKeys[this.KEY_FOUR_APP_READ_WRITE]
        ),
      },
      verificationToken: this.uint8ArrayToHexString(this.socket.enrollment.data.verificationToken),
      antiDuplicationToken: this.uint8ArrayToHexString(this.socket.enrollment.data.antiDuplicationToken),
      userId: this.userId,
    } as Omit<NFCCard, 'id'>);

    this.socket.enrollment = undefined;

    this.socket.send(
      JSON.stringify(
        new FabreaderEvent(FabreaderEventType.DISPLAY_TEXT, {
          message: 'NFC Card enrolled successfully',
        })
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const nextState = new InitialReaderState(this.socket, this.services);
    return nextState.getInitMessage();
  }

  private async onNfcRemoved() {
    this.socket.enrollment = undefined;

    this.socket.send(
      JSON.stringify(
        new FabreaderEvent(FabreaderEventType.DISPLAY_TEXT, {
          message: 'NFC Card removed',
        })
      )
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const nextState = new InitialReaderState(this.socket, this.services);
    return nextState.getInitMessage();
  }

  public async getInitMessage(): Promise<FabreaderEvent> {
    this.socket.enrollment = {
      lastSendEvent: FabreaderEventType.GET_NFC_UID,
      data: {},
    };
    return new FabreaderEvent(FabreaderEventType.GET_NFC_UID);
  }
}
