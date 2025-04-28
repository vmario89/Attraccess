import { Reader } from '../persistence/db/entities/reader.entity';
import { ReaderState } from './reader-states/reader-state.interface';

interface FabreaderMessageBaseData<TPayload = unknown> {
  auth?: {
    id: number;
    token: string;
  };
  payload: TPayload;
}

export enum FabreaderEventType {
  REGISTER = 'REGISTER',
  AUTHENTICATE = 'AUTHENTICATE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  DISPLAY_TEXT = 'DISPLAY_TEXT',
  PROMPT_SELECTION = 'PROMPT_SELECTION',
  NFC_TAP = 'NFC_TAP',
  GET_NFC_UID = 'GET_NFC_UID',
  CHANGE_KEYS = 'CHANGE_KEYS',
  WRITE_FILES = 'WRITE_FILES',
  NFC_REMOVED = 'NFC_REMOVED',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class FabreaderEvent<TPayload = any | undefined> {
  public readonly event: 'EVENT';
  public readonly data: FabreaderMessageBaseData<TPayload> & {
    type: FabreaderEventType;
  };

  public constructor(type: FabreaderEventType, payload: TPayload = undefined) {
    this.data = {
      type,
      payload,
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class FabreaderResponse<TPayload = any | undefined> {
  public readonly event: 'RESPONSE';
  public readonly data: FabreaderMessageBaseData<TPayload> & {
    type: FabreaderEventType;
  };

  public constructor(type: FabreaderEventType, payload: TPayload) {
    this.data = {
      type,
      payload,
    };
  }

  public static fromEventData<TPayload>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventData: FabreaderEvent<any>['data'],
    payload: TPayload
  ): FabreaderResponse<TPayload> {
    return new FabreaderResponse(eventData.type, payload);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FabreaderMessage<TPayload = any | undefined> = FabreaderEvent<TPayload> | FabreaderResponse<TPayload>;

export interface AuthenticatedWebSocket extends WebSocket {
  reader?: Reader;
  state?: ReaderState;
}
