/**
 * Events emitted when resource usage status changes
 */

export class ResourceUsageStartedEvent {
  constructor(
    public readonly resourceId: number,
    public readonly userId: number | null,
    public readonly startTime: Date
  ) {}
}

export class ResourceUsageEndedEvent {
  constructor(
    public readonly resourceId: number,
    public readonly userId: number | null,
    public readonly startTime: Date,
    public readonly endTime: Date
  ) {}
}
