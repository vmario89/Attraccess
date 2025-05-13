import { Reader } from './modules/persistence/db/entities/reader.entity';

export class ReaderUpdatedEvent {
  constructor(public readonly reader: Reader) {}
}
