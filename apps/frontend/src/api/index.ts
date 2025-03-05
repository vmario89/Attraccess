import { Api, AuthControllerPostSessionData } from '@attraccess/api-client';

function getInferredApiUrl() {
  const frontendUrl = new URL(window.location.href);

  const hostnameIsIP = frontendUrl.hostname.match(/^[0-9.]+$/);
  const isLocalhost = frontendUrl.hostname === 'localhost';

  if (hostnameIsIP || isLocalhost) {
    return `${frontendUrl.protocol}//${frontendUrl.hostname}:3000`;
  }

  return `${frontendUrl.protocol}//${frontendUrl.hostname}:${frontendUrl.port}/api`;
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
