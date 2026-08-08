import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In local dev, falls back to '/api/v1' which is proxied by Vite to localhost:5000.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
