import { Resource } from '@attraccess/api-client';

/**
 * Creates a mock resource with the given overrides
 */
export function createMockResource(overrides?: Partial<Resource>): Resource {
  return {
    id: 1,
    name: 'Test Resource',
    description: 'Test Description',
    status: 'ready',
    totalUsageHours: 100,
    imageFilename: 'test.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
