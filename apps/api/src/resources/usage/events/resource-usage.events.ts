/**
 * Events emitted when resource usage status changes
 */

export interface UserInfo {
  id: number;
  username: string;
}

export class ResourceUsageStartedEvent {
  constructor(
    public readonly resourceId: number,
    public readonly startTime: Date,
    public readonly user: UserInfo
  ) {}
}

export class ResourceUsageEndedEvent {
  constructor(
    public readonly resourceId: number,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly user: UserInfo
  ) {}
}
