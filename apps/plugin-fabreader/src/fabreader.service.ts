import { Injectable, Logger } from '@nestjs/common';
import { SystemEvent, SystemEventPayload, SystemEventResponse } from '@attraccess/plugins';

@Injectable()
export class FabreaderService {
  private readonly logger = new Logger(FabreaderService.name);

  async on<TEvent extends SystemEvent>(
    event: TEvent,
    payload: SystemEventPayload[TEvent]
  ): Promise<SystemEventResponse[TEvent] | null> {
    this.logger.log(`FabreaderService handling event: ${event}`);
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

    let response: SystemEventResponse[TEvent] | null = null;

    switch (event) {
      case SystemEvent.RESOURCE_USAGE_STARTED:
        this.logger.log(`Handling ${SystemEvent.RESOURCE_USAGE_STARTED} event in FabreaderService.`);

        response = {
          continue: false,
        } as SystemEventResponse[TEvent];
        break;
      default:
        this.logger.log(`Unhandled event type in FabreaderService: ${event}`);
        response = null;
        break;
    }

    this.logger.log(`FabreaderService returning response: ${JSON.stringify(response)}`);
    return response;
  }
}
