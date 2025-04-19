import { Logger } from '@nestjs/common';
import {
  PluginInterface,
  SemanticVersion,
  SystemEventPayload,
  SystemEvent,
  SystemEventResponse,
} from '@attraccess/plugins';

export default class PluginDemo implements PluginInterface {
  private readonly logger = new Logger(PluginDemo.name);

  load(attraccessVersion: SemanticVersion) {
    this.logger.log(`PluginDemo load called with Attraccess version: ${attraccessVersion}`);
    return {
      module: PluginDemo,
    };
  }

  async on<TEvent extends SystemEvent>(
    event: TEvent,
    payload: SystemEventPayload[TEvent]
  ): Promise<SystemEventResponse[TEvent] | null> {
    this.logger.log(`PluginDemo on called with event: ${event}`);
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);

    let response: SystemEventResponse[TEvent] | null = null;

    switch (event) {
      case SystemEvent.RESOURCE_USAGE_STARTED:
        this.logger.log(`Handling ${SystemEvent.RESOURCE_USAGE_STARTED} event.`);
        response = {
          continue: false,
        } as SystemEventResponse[TEvent];
        break;
      default:
        this.logger.log(`Unhandled event type: ${event}`);
        response = null;
        break;
    }

    this.logger.log(`PluginDemo on returning response: ${JSON.stringify(response)}`);
    return response;
  }
}
