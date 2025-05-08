import { Injectable, Logger } from '@nestjs/common';
import { SystemEvent, SystemEventPayload, SystemEventResponse } from '@attraccess/plugins-backend-sdk';
import { subtle } from 'crypto';

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

  public uint8ArrayToHexString(uint8Array: Uint8Array) {
    return Array.from(uint8Array)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generates a new key for the NFC card based on a seed which is based on the current month,
   * the keyNo and the cardUID.
   * @param keyNo The key number to generate
   * @param cardUID The UID of the NFC card
   * @returns 16 bytes Uint8Array
   */
  public async generateNTAG424Key(data: { keyNo: number; cardUID: string }) {
    const seed = `${new Date().getMonth()}${data.keyNo}${data.cardUID}`;
    const seedBytes = new TextEncoder().encode(seed);
    const key = await subtle.digest('SHA-256', seedBytes);
    return new Uint8Array(key).slice(0, 16);
  }
}
