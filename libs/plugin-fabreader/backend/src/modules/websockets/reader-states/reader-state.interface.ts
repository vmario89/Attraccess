import { FabreaderEvent, FabreaderMessage, FabreaderResponse } from '../websocket.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WsMessageThing = undefined | FabreaderMessage<any> | FabreaderEvent<any> | FabreaderResponse<any>;

export interface ReaderState {
  onEvent(data: FabreaderEvent['data']): Promise<WsMessageThing>;
  onResponse(data: FabreaderResponse['data']): Promise<WsMessageThing>;

  getInitMessage(): Promise<WsMessageThing>;
}
