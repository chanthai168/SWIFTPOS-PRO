// src/services/api.ts
import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a variable to hold the Auth0 function
let getTokenSilently: (() => Promise<string | undefined>) | null = null;

// Export a function so React can inject the hook's method
export const setTokenGetter = (getter: () => Promise<string | undefined>) => {
  getTokenSilently = getter;
};

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  // Check if React has injected the function yet
  if (getTokenSilently) {
    try {
      const token = await getTokenSilently(); // Remember to await!
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to get token", error);
    }
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Note: With Auth0, you typically wouldn't manage localStorage manually.
      // You might want to let Auth0 handle the redirect here.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;