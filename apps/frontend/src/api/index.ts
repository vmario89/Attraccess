import { Api } from '@attraccess/api-client';

const api = new Api({
  baseUrl: import.meta.env.VITE_API_URL,
});

export default api;
