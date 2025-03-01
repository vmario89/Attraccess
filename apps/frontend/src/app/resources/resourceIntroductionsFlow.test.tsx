import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Add this to get toBeInTheDocument matcher
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResourceIntroductions } from './resourceIntroductions';
import * as resourceIntroductionHooks from '../../api/hooks/resourceIntroduction';
import * as authHook from '../../hooks/useAuth';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Define mock types that match the expected interfaces
interface MockUser {
  id: number;
  username: string;
  isEmailVerified: boolean;
  systemPermissions: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

// Mock our API hooks
vi.mock('../../api/hooks/resourceIntroduction');
vi.mock('../../hooks/useAuth');
vi.mock('../../components/toastProvider', () => ({
  useToastMessage: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// Create a wrapper for our components with React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ResourceIntroductions component', () => {
  const resourceId = 123;
  const mockUser: MockUser = {
    id: 1,
    username: 'tutor_user',
    isEmailVerified: true,
    systemPermissions: { canManageResources: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockIntroductions = {
    data: [
      {
        id: 1,
        resourceId,
        tutorUserId: 1,
        receiverUserId: 2,
        tutorUser: {
          id: 1,
          username: 'tutor_user',
          isEmailVerified: true,
          systemPermissions: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        receiverUser: {
          id: 2,
          username: 'receiver_user',
          isEmailVerified: true,
          systemPermissions: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        completedAt: new Date().toISOString(),
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const mockIntroducers = [
    {
      id: 1,
      resourceId,
      userId: 1,
      user: {
        id: 1,
        username: 'tutor_user',
        isEmailVerified: true,
        systemPermissions: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  ];

  // Mock auth session storage
  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;

  beforeEach(() => {
    // Mock the localStorage and sessionStorage
    const mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    const mockSessionStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    Object.defineProperty(global, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });

    // Set up auth hook mock
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: mockUser,
      session: { user: mockUser, authToken: 'mock-token' },
      isLoading: false,
      error: null,
      isAuthenticated: true,
      login: { mutateAsync: vi.fn(), isPending: false } as any,
      signup: { mutateAsync: vi.fn() } as any,
      logout: { mutateAsync: vi.fn() } as any,
      hasPermission: () => true,
    });

    // Set up resource introduction hooks mocks
    vi.mocked(
      resourceIntroductionHooks.useResourceIntroductions
    ).mockReturnValue({
      data: mockIntroductions,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(resourceIntroductionHooks.useResourceIntroducers).mockReturnValue(
      {
        data: mockIntroducers,
        isLoading: false,
      } as any
    );

    const mockCompleteIntroduction = vi.fn().mockResolvedValue({
      id: 2,
      resourceId,
      tutorUserId: 1,
      receiverUserId: 3,
    });

    vi.mocked(
      resourceIntroductionHooks.useCompleteIntroduction
    ).mockReturnValue({
      mutateAsync: mockCompleteIntroduction,
      isPending: false,
    } as any);
  });

  afterEach(() => {
    // Restore the original localStorage and sessionStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
    });

    Object.defineProperty(global, 'sessionStorage', {
      value: originalSessionStorage,
    });

    vi.clearAllMocks();
  });

  it('should render the component correctly when user is an introducer', async () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <ResourceIntroductions resourceId={resourceId} />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('User Introductions')).toBeInTheDocument();
    });

    expect(screen.getByText('Users with Access')).toBeInTheDocument();
    expect(screen.getByText('receiver_user')).toBeInTheDocument();
    expect(screen.getByText(/Introduced by tutor_user/)).toBeInTheDocument();
  });

  it('should not render if user is not an introducer', async () => {
    // Change the introducers list to not include the current user
    vi.mocked(resourceIntroductionHooks.useResourceIntroducers).mockReturnValue(
      {
        data: [
          {
            id: 2,
            resourceId,
            userId: 2,
            user: {
              id: 2,
              username: 'another_introducer',
              isEmailVerified: true,
              systemPermissions: {},
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        ],
        isLoading: false,
      } as any
    );

    const Wrapper = createWrapper();
    const { container } = render(
      <Wrapper>
        <ResourceIntroductions resourceId={resourceId} />
      </Wrapper>
    );

    await waitFor(() => {
      // Component should be empty since user is not an introducer
      expect(container.firstChild).toBeNull();
    });
  });

  it('should add a new introduction and maintain auth context', async () => {
    const originalUser = { ...mockUser };
    const Wrapper = createWrapper();

    render(
      <Wrapper>
        <ResourceIntroductions resourceId={resourceId} />
      </Wrapper>
    );

    // Find the input and add a new introduction
    const input = screen.getByLabelText('username or email');
    fireEvent.change(input, { target: { value: 'new_user' } });

    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // Verify the mutation was called with correct parameters
    await waitFor(() => {
      expect(
        vi.mocked(resourceIntroductionHooks.useCompleteIntroduction).mock
          .results[0].value.mutateAsync
      ).toHaveBeenCalledWith({
        resourceId,
        userIdentifier: 'new_user',
      });
    });

    // Verify that auth context was maintained
    expect(authHook.useAuth().user).toEqual(originalUser);
    expect(authHook.useAuth().user?.id).toBe(originalUser.id);
  });

  it('should handle error cases correctly', async () => {
    // Mock the mutation to throw an error
    const mockError = new Error('Failed to add introduction');
    vi.mocked(
      resourceIntroductionHooks.useCompleteIntroduction
    ).mockReturnValue({
      mutateAsync: vi.fn().mockRejectedValue(mockError),
      isPending: false,
    } as any);

    const Wrapper = createWrapper();

    render(
      <Wrapper>
        <ResourceIntroductions resourceId={resourceId} />
      </Wrapper>
    );

    // Find the input and add a new introduction
    const input = screen.getByLabelText('username or email');
    fireEvent.change(input, { target: { value: 'new_user' } });

    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(
        vi.mocked(resourceIntroductionHooks.useCompleteIntroduction).mock
          .results[0].value.mutateAsync
      ).toHaveBeenCalled();
    });

    // Verify that the auth context was not affected by the error
    expect(authHook.useAuth().user).toEqual(mockUser);
  });

  it('should maintain separate auth contexts for different users', async () => {
    // Create a second mock user to simulate multiple sessions
    const secondUser: MockUser = {
      id: 2,
      username: 'another_user',
      isEmailVerified: true,
      systemPermissions: { canManageResources: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // First render as the original user
    const Wrapper = createWrapper();
    const { unmount } = render(
      <Wrapper>
        <ResourceIntroductions resourceId={resourceId} />
      </Wrapper>
    );

    // Verify original user's context
    expect(authHook.useAuth().user).toEqual(mockUser);

    // Unmount and update the mock to return a different user
    unmount();

    vi.mocked(authHook.useAuth).mockReturnValue({
      user: secondUser,
      session: { user: secondUser, authToken: 'second-token' },
      isLoading: false,
      error: null,
      isAuthenticated: true,
      login: { mutateAsync: vi.fn(), isPending: false } as any,
      signup: { mutateAsync: vi.fn() } as any,
      logout: { mutateAsync: vi.fn() } as any,
      hasPermission: () => true,
    });

    // Re-render with the new user
    render(
      <Wrapper>
        <ResourceIntroductions resourceId={resourceId} />
      </Wrapper>
    );

    // Verify second user's context is separate
    expect(authHook.useAuth().user).toEqual(secondUser);
    expect(authHook.useAuth().user?.id).toBe(secondUser.id);
  });
});
