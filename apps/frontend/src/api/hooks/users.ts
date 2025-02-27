import { useMutation } from '@tanstack/react-query';
import { VerifyEmailDto } from '@attraccess/api-client';
import getApi from '../index';

interface VerifyEmailError {
  message: string;
  statusCode: number;
}

export function useVerifyEmail() {
  return useMutation<void, VerifyEmailError, VerifyEmailDto>({
    mutationFn: async ({ email, token }) => {
      const api = getApi();
      await api.users.usersControllerVerifyEmail({
        email,
        token,
      });
    },
  });
}
