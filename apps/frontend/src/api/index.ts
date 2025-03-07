import { Api, AuthControllerPostSessionData } from '@attraccess/api-client';

function getInferredApiUrl() {
  const frontendUrl = new URL(window.location.href);

  let port = '';
  if (frontendUrl.port) {
    port = `:${frontendUrl.port}`;
  }

  return `${frontendUrl.protocol}//${frontendUrl.hostname}${port}`;
}

function getBaseUrl() {
  return import.meta.env.VITE_API_URL || getInferredApiUrl();
}

const getApi = () => {
  const api = new Api<{ token?: string }>({
    baseUrl: getBaseUrl(),
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
  return `${getBaseUrl()}${name}`;
}

export default getApi;
