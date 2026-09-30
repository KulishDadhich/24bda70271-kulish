/**
 * Central API Client
 * Configures Axios with base URL, authentication headers, and global interceptors.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from localStorage
api.interceptors.request.use(
  config => {
    const authData = localStorage.getItem('foodverse_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed?.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response Interceptor: Handle unhandled errors
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error Response:', message);
    return Promise.reject(error);
  }
);

export default api;
