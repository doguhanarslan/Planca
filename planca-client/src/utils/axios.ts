import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { refreshUserToken } from '@/features/auth/authSlice';
import { Store } from '@reduxjs/toolkit';

// Create an Axios instance with a base URL
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5288/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HTTP-only cookies
});

// Store for Redux dispatch function
let storeDispatch: any = null;

/**
 * Initialize Axios with Redux store
 * @param store - Redux store
 */
export const initializeAxios = (store: Store): void => {
  storeDispatch = store.dispatch;

  // Add interceptor to include tenant ID in header
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const state = store.getState();
      if (state.auth.tenant?.id) {
        // Set the tenant ID header
        config.headers.set('X-TenantId', state.auth.tenant.id);
      }
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
  );

  // Add response interceptor for token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // Type assertion for originalRequest
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If error 401 and not yet retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Refresh token
          await storeDispatch(refreshUserToken());
          
          // Retry original request (token automatically included in HttpOnly cookie)
          if (originalRequest) {
            return instance(originalRequest);
          }
        } catch (refreshError) {
          // Token refresh failed
          console.error('Token refresh failed:', refreshError);
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default instance;