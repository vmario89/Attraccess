import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';

interface Reader {
  id: number;
  name: string;
  // Add other reader properties as needed
}

// API client for reader-related requests
const readerApi = {
  getReaders: async (): Promise<Reader[]> => {
    const authToken = useAuthStore.getState().authToken;
    const response = await fetch('/fabreader/readers', {
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch readers');
    }

    return response.json();
  },

  enrollNfcCard: async (readerId: number): Promise<{ message: string }> => {
    const authToken = useAuthStore.getState().authToken;
    const response = await fetch(`/fabreader/readers/${readerId}/enroll-nfc-card`, {
      method: 'POST',
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to enroll NFC card');
    }

    return response.json();
  },
};

// React Query hooks
export const useReaders = () => {
  const authToken = useAuthStore((state) => state.authToken);

  return useQuery({
    queryKey: ['plugin-fabreader', 'readers', 'getAll', authToken],
    queryFn: readerApi.getReaders,
    enabled: !!authToken, // Only run query if auth token is available
  });
};

export const useEnrollNfcCard = () => {
  return useMutation({
    mutationKey: ['plugin-fabreader', 'readers', 'enrollNfcCard'],
    mutationFn: (readerId: number) => readerApi.enrollNfcCard(readerId),
  });
};
