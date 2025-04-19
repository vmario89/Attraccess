import { DynamicModule } from '@nestjs/common';
import { User as UserEntity, Resource as ResourceEntity } from '@attraccess/database-entities';
import { SemanticVersion } from './semver';

export type User = UserEntity;
export type Resource = ResourceEntity;

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

  on<TEvent extends SystemEvent>(
    event: TEvent,
    payload: SystemEventPayload[TEvent]
  ): Promise<SystemEventResponse[TEvent] | null>;
}
