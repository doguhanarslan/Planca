// src/services/api.ts
import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Önemli: Cookie'lerin gönderilmesini sağlar
});

// Auth services
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/Auth/login', credentials);
    return response.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/Auth/register', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/Auth/logout');
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/Auth/refresh-token');
    return response.data;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/Auth/current-user');
    return response.data;
  },
  
  async getTenantId(): Promise<string | null> {
    try {
      const response = await api.get<{tenantId: string}>('/Tenants/tenant-id');
      return response.data.tenantId;
    } catch {
      return null;
    }
  }
};

// Define queue item type for failed requests
interface QueueItem {
  resolve: (value: void) => void;
  reject: (error: Error) => void;
}

// Add response interceptor for token refresh
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response): AxiosResponse => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If error is unauthorized and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refreshing is in progress, queue this request
        try {
          await new Promise<void>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await authService.refreshToken();
        processQueue(null);
        isRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError instanceof Error ? refreshError : new Error('Unknown refresh error'));
        isRefreshing = false;
        // Redirect to login page as refresh token has expired
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;