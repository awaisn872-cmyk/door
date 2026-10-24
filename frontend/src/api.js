
import axios from 'axios';

const api = axios.create({
  baseURL: (
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api'
  ).replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('dd_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    const requestUrl = String(error.config?.url || '');
    const isLoginRequest = requestUrl.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('dd_token');
      localStorage.removeItem('dd_user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const messageOf = error =>
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong.';

export default api;
