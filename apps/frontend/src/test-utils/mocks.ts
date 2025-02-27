import { Resource } from '@attraccess/api-client';

/**
 * Mock implementations for resource hooks
 */
export const mockResourceHooks = {
  useResource: jest.fn(),
  useResources: jest.fn(),
  useCreateResource: jest.fn(),
  useUpdateResource: jest.fn(),
  useDeleteResource: jest.fn(),
};

/**
 * Mock implementations for toast hooks
 */
export const mockToastHooks = {
  ToastProvider: jest.fn(({ children }) => children),
  useToastMessage: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  })),
};

/**
 * Sets up successful resource hook mocks
 */
export function setupSuccessfulResourceMocks(resource: Resource) {
  mockResourceHooks.useResource.mockReturnValue({
    data: resource,
    isLoading: false,
    error: null,
  });
}

/**
 * Sets up loading state mocks
 */
export function setupLoadingMocks() {
  mockResourceHooks.useResource.mockReturnValue({
    data: undefined,
    isLoading: true,
    error: null,
  });
}

/**
 * Sets up error state mocks
 */
export function setupErrorMocks(errorMessage: string) {
  const error = new Error(errorMessage);

  mockResourceHooks.useResource.mockReturnValue({
    data: undefined,
    isLoading: false,
    error,
  });
}

/**
 * Resets all mocks
 */
export function resetAllMocks() {
  Object.values(mockResourceHooks).forEach((mock) => mock.mockReset());
  Object.values(mockToastHooks).forEach((mock) => mock.mockReset());
}

/**
 * Mock implementations for window methods
 */
export const mockWindow = {
  scrollTo: jest.fn(),
  matchMedia: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
};
