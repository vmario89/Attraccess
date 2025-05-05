import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useStore } from '../store/store';
import { getQueryKey } from './keys';

export interface NFCCard {
  id: number;
  uid: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// API client for reader-related requests
const cardApi = {
  getCards: async (): Promise<NFCCard[]> => {
    const { auth, endpoint } = useStore.getState();

    const response = await fetch(`${endpoint}/api/fabreader/cards`, {
      method: 'GET',
      headers: {
        Authorization: auth?.authToken ? `Bearer ${auth.authToken}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cards');
    }

    return response.json();
  },
};

// React Query hooks
export const useCards = (options?: Partial<UseQueryOptions<NFCCard[], Error>>) => {
  const { endpoint, auth } = useStore();

  return useQuery({
    queryKey: getQueryKey('cards', ['getAll']),
    queryFn: cardApi.getCards,
    enabled: !!endpoint && !!auth?.authToken,
    ...options,
  });
};
