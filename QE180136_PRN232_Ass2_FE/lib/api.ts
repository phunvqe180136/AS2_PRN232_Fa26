import axios, { AxiosError } from 'axios';
import { API_URL } from './config';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60s to accommodate Render cold start
});

// Request Interceptor: Attach JWT Bearer Token if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor: Auto-refresh token on 401 or redirect to login
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (!error.response) {
      return Promise.reject(error);
    }

    const { status, config } = error.response;
    const url = config?.url || '';

    // If 401 and not already refreshing, not login/register/refresh
    if (
      status === 401 &&
      !originalRequest._retry &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/register') &&
      !url.includes('/auth/refresh')
    ) {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/profile')) {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          }
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { token: newToken, refreshToken: newRefreshToken, user } = res.data;
          localStorage.setItem('token', newToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
          if (user) localStorage.setItem('user', JSON.stringify(user));

          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/profile')) {
            window.location.href = `/login?expired=true&redirect=${encodeURIComponent(window.location.pathname)}`;
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(err: unknown): string {
  const e = err as AxiosError<{ error?: string; errors?: Record<string, string[]>; title?: string; message?: string }>;
  if (e.response?.data) {
    const d = e.response.data;
    if (d.error) return d.error;
    if (d.message) return d.message;
    if (d.errors) {
      const firstKey = Object.keys(d.errors)[0];
      if (firstKey) return `${firstKey}: ${d.errors[firstKey].join(', ')}`;
    }
    if (d.title) return d.title;
  }
  return e.message || 'Unexpected error';
}
