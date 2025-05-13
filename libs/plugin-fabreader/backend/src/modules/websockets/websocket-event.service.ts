import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FabreaderGateway } from './websocket.gateway';
import { ReaderUpdatedEvent } from '../../events';

@Injectable()
export class WebSocketEventService {
  private readonly logger = new Logger(WebSocketEventService.name);

  @Inject(FabreaderGateway)
  private readonly fabreaderGateway: FabreaderGateway;

  @OnEvent('reader.updated')
  public async onReaderUpdated(event: ReaderUpdatedEvent) {
    this.logger.debug('Got reader updated event', event);
    await this.fabreaderGateway.restartReader(event.reader.id);
  }
}
