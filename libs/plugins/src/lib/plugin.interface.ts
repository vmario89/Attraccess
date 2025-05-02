import { DynamicModule, InjectionToken, Type } from '@nestjs/common';
import { SemanticVersion } from './semver';
import { Resource, User } from '@attraccess/database-entities';

export enum SystemEvent {
  RESOURCE_USAGE_STARTED = 'RESOURCE_USAGE_STARTED',
  RESOURCE_USAGE_ENDED = 'RESOURCE_USAGE_ENDED',
}

export type SystemEventPayload = {
  [SystemEvent.RESOURCE_USAGE_STARTED]: { resource: Resource; user: User };
  [SystemEvent.RESOURCE_USAGE_ENDED]: { resource: Resource; user: User };
};

export type SystemEventResponse = {
  [SystemEvent.RESOURCE_USAGE_STARTED]: null;
  [SystemEvent.RESOURCE_USAGE_ENDED]: null;
};

export type BlockableSystemEventResponse = {
  /**
   * @default true
   */
  continue?: boolean;
};

/**
 * Defines the contract for a NestJS plugin.
 * Each plugin module must export a default class that implements this interface.
 */
export interface PluginInterface {
  /**
   * A method that returns the NestJS DynamicModule representing the plugin.
   * This allows plugins to configure themselves, register providers, controllers, etc.
   */
  load(attraccessVersion: SemanticVersion): Promise<DynamicModule> | DynamicModule;

  /**
   * Returns the injection token or class of the service within the plugin's module
   * that should handle system events.
   *
   * @returns The injection token or class type (e.g., MyPluginEventHandlerService).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEventHandlerToken(): InjectionToken | Type<any>;
}
