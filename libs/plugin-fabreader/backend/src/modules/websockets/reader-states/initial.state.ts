import { Logger } from '@nestjs/common';
import { ReaderState } from './reader-state.interface';
import { NoResourcesAttachedState } from './no-resources-attached.state';
import { WaitForResourceSelectionState } from './wait-for-resource-selection.state';
import { WaitForNFCTapState } from './wait-for-nfc-tap.state';
import { GatewayServices } from '../websocket.gateway';
import {
  AuthenticatedWebSocket,
  FabreaderEvent,
  FabreaderEventType,
  FabreaderMessage,
  FabreaderResponse,
} from '../websocket.types';
import { verifyToken } from '../websocket.utils';

export class InitialReaderState implements ReaderState {
  private readonly logger = new Logger(InitialReaderState.name);

  public constructor(private readonly socket: AuthenticatedWebSocket, private readonly services: GatewayServices) {}

  public async getInitMessage(forceInit = false) {
    if (forceInit === true) {
      this.socket.reader = null;
      return new FabreaderEvent(FabreaderEventType.REAUTHENTICATE, {});
    }

    if (this.socket.reader) {
      return await this.onIsAuthenticated();
    }
    return undefined;
  }

  public async onEvent(data: FabreaderEvent['data']) {
    switch (data.type) {
      case FabreaderEventType.REGISTER:
        return await this.handleRegisterEvent(data);

      case FabreaderEventType.AUTHENTICATE:
        return await this.handleAuthenticateEvent(data);

      default:
        this.logger.warn(`Received unknown event type: ${data.type}`);
        return undefined;
    }
  }

  public async onResponse(data: FabreaderResponse['data']) {
    this.logger.debug(`Received response: ${JSON.stringify(data)}`);
    return undefined;
  }

  private async onIsAuthenticated() {
    this.logger.debug('Getting resources of reader', this.socket.reader.hasAccessToResourceIds);
    const resourcesOfReader = await this.services.dbService.getManyResourcesById(
      this.socket.reader.hasAccessToResourceIds
    );
    if (resourcesOfReader.length === 0) {
      this.logger.debug('No resources attached to reader, moving reader to NoResourcesAttachedState');
      const nextState = new NoResourcesAttachedState(this.socket, this.services);
      this.socket.state = nextState;
      return await nextState.getInitMessage();
    }

    if (resourcesOfReader.length > 1) {
      this.logger.debug('Resources attached to reader, moving reader to WaitForResourceSelectionState');

      const nextState = new WaitForResourceSelectionState(this.socket, this.services, resourcesOfReader);
      this.socket.state = nextState;
      return await nextState.getInitMessage();
    }

    this.logger.debug('Reader has only one resource attached, moving reader to WaitForNFCTapState');
    const nextState = new WaitForNFCTapState(this.socket, this.services, resourcesOfReader[0].id);
    this.socket.state = nextState;
    return await nextState.getInitMessage();
  }

  public async handleRegisterEvent(data: FabreaderEvent['data']): Promise<FabreaderMessage | undefined> {
    this.logger.debug('Received REGISTER event');
    const response = await this.services.dbService.createNewReader();

    this.logger.debug(
      `Sending REGISTER response to client. Reader ID: ${response.reader.id}, Token: ${response.token}`
    );

    return FabreaderResponse.fromEventData(data, {
      id: response.reader.id,
      token: response.token,
    });
  }

  public async handleAuthenticateEvent(data: FabreaderEvent['data']): Promise<FabreaderMessage | undefined> {
    this.logger.debug('processing AUTHENTICATE event', data);

    const unauthorizedResponse = new FabreaderEvent(FabreaderEventType.UNAUTHORIZED, {});

    const reader = await this.services.dbService.findReaderById(data.payload.id);
    if (!reader) {
      this.logger.error('No reader-config found for socket, sending UNAUTHORIZED response to client');
      return unauthorizedResponse;
    }

    const isValidToken = await verifyToken(data.payload.token, reader.apiTokenHash);
    if (!isValidToken) {
      this.logger.error('Invalid token, sending UNAUTHORIZED response to client');
      return unauthorizedResponse;
    }

    const authenticatedResponse = new FabreaderResponse(FabreaderEventType.READER_AUTHENTICATED, {
      name: reader.name,
    });
    this.socket.send(JSON.stringify(authenticatedResponse));
    await new Promise((resolve) => setTimeout(resolve, 400));

    this.socket.reader = reader;

    return this.onIsAuthenticated();
  }
}
