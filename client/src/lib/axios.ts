// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // sends refreshToken cookie
});

// ── request interceptor: attach access token ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── response interceptor: handle 401 ──
let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  queue = [];
};

api.interceptors.response.use(
  (response) => response, // pass through successful responses

  async (error) => {
    const originalRequest = error.config;

    // only handle 401 and don't retry the refresh call itself
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // queue requests that come in while refresh is in progress
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }).catch(error=> {
        return Promise.reject(error);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post("/api/auth/refresh");
      const newToken = data.accessToken;

      localStorage.setItem("accessToken", newToken);
      api.defaults.headers.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest); // retry original request
    } catch (refreshError) {
      processQueue(refreshError, null);

      // refresh failed → force logout
      localStorage.removeItem("accessToken");
      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;