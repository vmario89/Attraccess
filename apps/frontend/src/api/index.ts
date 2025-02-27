import { Api, AuthControllerPostSessionData } from '@attraccess/api-client';

const getApi = () => {
  const api = new Api<{ token?: string }>({
    baseUrl: import.meta.env.VITE_API_URL,
    securityWorker: (config) => {
      return {
        headers: {
          Authorization: `Bearer ${config?.token}`,
        },
      };
    },
  });

  const authFromLocalStorage = localStorage.getItem('auth');

  if (authFromLocalStorage) {
    const auth = JSON.parse(
      authFromLocalStorage
    ) as AuthControllerPostSessionData;
    api.setSecurityData({
      token: auth.authToken,
    });
  }

  return api;
};

export function filenameToUrl(name: string) {
  return `${import.meta.env.VITE_API_URL}${name}`;
}

export default getApi;
