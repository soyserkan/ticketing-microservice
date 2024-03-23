import axios from 'axios';

export default ({ req }) => {
  const baseURL = (typeof window === 'undefined') ? 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local' : '/';
  const api = axios.create({ baseURL, headers: req?.headers });
  api.interceptors.response.use((response) => response, (error) => {
    throw error.response.data;
  });
  return api;
};