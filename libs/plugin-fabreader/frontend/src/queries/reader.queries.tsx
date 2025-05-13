import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useStore } from '../store/store';
import { getQueryKey } from './keys';

interface Reader {
  id: number;
  name: string;
  hasAccessToResourceIds: number[];
  lastConnection: string;
  firstConnection: string;
  connected: boolean;
}

// API client for reader-related requests
const readerApi = {
  getReaders: async (): Promise<Reader[]> => {
    const { endpoint, auth } = useStore.getState();

    const response = await fetch(`${endpoint}/api/fabreader/readers`, {
      method: 'GET',
      headers: {
        Authorization: auth?.authToken ? `Bearer ${auth.authToken}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch readers');
    }

    return response.json();
  },

  getOneReader: async (readerId: number): Promise<Reader> => {
    const { auth, endpoint } = useStore.getState();

    const response = await fetch(`${endpoint}/api/fabreader/readers/${readerId}`, {
      method: 'GET',
      headers: {
        Authorization: auth?.authToken ? `Bearer ${auth.authToken}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reader');
    }

    return response.json();
  },

  enrollNfcCard: async (readerId: number): Promise<{ message: string }> => {
    const { auth, endpoint } = useStore.getState();

    if (!auth?.authToken || !endpoint) {
      throw new Error('No auth token or endpoint');
    }

    const response = await fetch(`${endpoint}/api/fabreader/readers/${readerId}/enroll-nfc-card`, {
      method: 'POST',
      headers: {
        Authorization: auth?.authToken ? `Bearer ${auth.authToken}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to enroll NFC card');
    }

    return response.json();
  },

  resetNfcCard: async (readerId: number, cardId: number): Promise<{ message: string }> => {
    const { auth, endpoint } = useStore.getState();

    if (!auth?.authToken || !endpoint) {
      throw new Error('No auth token or endpoint');
    }

    const response = await fetch(`${endpoint}/api/fabreader/readers/${readerId}/reset-nfc-card/${cardId}`, {
      method: 'POST',
      headers: {
        Authorization: auth?.authToken ? `Bearer ${auth.authToken}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to reset NFC card');
    }

    return response.json();
  },

  updateReader: async (
    readerId: number,
    data: { name?: string; connectedResources?: number[] }
  ): Promise<{ message: string; reader: Reader }> => {
    const { auth, endpoint } = useStore.getState();

    if (!auth?.authToken || !endpoint) {
      throw new Error('No auth token or endpoint');
    }

    const response = await fetch(`${endpoint}/api/fabreader/readers/${readerId}`, {
      method: 'PATCH',
      headers: {
        Authorization: auth?.authToken ? `Bearer ${auth.authToken}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update reader');
    }

    return response.json();
  },
};

// React Query hooks
export const useReaders = (options?: Partial<UseQueryOptions<Reader[], Error>>) => {
  const { endpoint, auth } = useStore();

  return useQuery({
    queryKey: getQueryKey('readers', ['getAll']),
    queryFn: readerApi.getReaders,
    enabled: !!endpoint && !!auth?.authToken,
    ...options,
  });
};

export const useOneReader = (readerId: number, options?: Partial<UseQueryOptions<Reader, Error>>) => {
  return useQuery({
    queryKey: getQueryKey('readers', ['getOne', readerId.toString()]),
    queryFn: () => readerApi.getOneReader(readerId),
    ...options,
  });
};

export const useEnrollNfcCard = (
  options?: Partial<UseMutationOptions<{ message: string }, Error, { readerId: number }>>
) => {
  return useMutation({
    mutationKey: getQueryKey('readers', ['enrollNfcCard']),
    mutationFn: ({ readerId }) => readerApi.enrollNfcCard(readerId),
    ...options,
  });
};

export const useUpdateReader = (
  options?: Partial<
    UseMutationOptions<
      { message: string; reader: Reader },
      Error,
      { readerId: number; data: { name?: string; connectedResources?: number[] } }
    >
  >
) => {
  return useMutation({
    mutationKey: getQueryKey('readers', ['updateReader']),
    mutationFn: ({ readerId, data }) => readerApi.updateReader(readerId, data),
    ...options,
  });
};

export const useResetNfcCard = (
  options?: Partial<UseMutationOptions<{ message: string }, Error, { readerId: number; cardId: number }>>
) => {
  return useMutation({
    mutationKey: getQueryKey('readers', ['resetNfcCard']),
    mutationFn: ({ readerId, cardId }) => readerApi.resetNfcCard(readerId, cardId),
    ...options,
  });
};
