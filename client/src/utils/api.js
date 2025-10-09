import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  // withCredentials: true, // uncomment if you use cookies/session auth
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;

  // If sending FormData, let the browser set boundary and don't stringify
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
    config.transformRequest = [(d) => d];
  }

  return config;
});

export default API;
