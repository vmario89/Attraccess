import { FabreaderEvent, FabreaderResponse } from '../websocket.types';

export interface ReaderState {
  onEvent(data: FabreaderEvent['data']): Promise<void>;
  onResponse(data: FabreaderResponse['data']): Promise<void>;

  onStateEnter(): Promise<void>;
  onStateExit(): Promise<void>;
}
