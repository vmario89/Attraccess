import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUrlQuery } from '../hooks/useUrlQuery';
import { useVerifyEmail } from '../api/hooks/users';
import { useNavigate } from 'react-router-dom';
import { Loading } from './loading';
import { Alert } from '@heroui/react';

export function VerifyEmail() {
  const query = useUrlQuery();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = useMemo(() => query.get('token'), [query]);
  const email = useMemo(() => query.get('email'), [query]);

  const verifyEmail = useVerifyEmail();

  const activateEmail = useCallback(async () => {
    if (!token || !email) {
      setError('Invalid verification link. Please request a new one.');
      return;
    }

    try {
      await verifyEmail.mutateAsync({ token, email });
      setIsSuccess(true);
      setError(null);
    } catch (err) {
      const error = err as { error?: { message?: string } };
      setError(error.error?.message || 'An unexpected error occurred');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email]);

  useEffect(() => {
    activateEmail();
  }, [activateEmail]);

  if (verifyEmail.isPending) {
    return <Loading />;
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your email has been successfully verified. You can now log in to
              your account.
            </p>
          </div>
          <div className="mt-8">
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Verification Failed
            </h2>
            <Alert
              color="danger"
              title="Error"
              description={error}
              className="mt-4"
            />
          </div>
          <div className="mt-8">
            <button
              onClick={activateEmail}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={verifyEmail.isPending}
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Loading />;
}
