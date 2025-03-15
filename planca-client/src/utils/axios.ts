import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { refreshUserToken } from '@/features/auth/authSlice';
import { Store } from '@reduxjs/toolkit';
import { STORAGE } from '@/utils/constants';
// Modern HTTP client configuration
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5288/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for HTTP-only cookies
  timeout: 30000, // Adding reasonable timeout
});

// Store for Redux dispatch function
let storeDispatch: any = null;

/**
 * Initialize Axios with Redux store and configure interceptors
 * @param store - Redux store
 */
export const initializeAxios = (store: Store): void => {
  storeDispatch = store.dispatch;

  // Add request interceptor to include tenant ID in header
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const state = store.getState();
      
      // Add tenant ID header if available
      if (state.auth.tenant?.id) {
        config.headers.set('X-TenantId', state.auth.tenant.id);
      }
      
      // Add authentication header if needed (for systems not using cookies)
      // if (state.auth.token) {
      //   config.headers.set('Authorization', `Bearer ${state.auth.token}`);
      // }
      
      // Add request timestamp for performance tracking
      config.headers.set('X-Request-Time', Date.now().toString());
      
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(STORAGE.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  // Add response interceptor for token refresh
  instance.interceptors.response.use(
    (response) => {
      // You can add response transformation logic here if needed
      return response;
    },
    async (error: AxiosError) => {
      // Type assertion for originalRequest
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // Handle network errors
      if (!error.response) {
        console.error('Network error: Please check your connection');
        return Promise.reject({
          ...error,
          message: 'Network error: Please check your connection',
        });
      }

      // If error 401 and not yet retried - token expired
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
          // Token refresh failed - user needs to log in again
          console.error('Authentication expired. Please log in again.');
          return Promise.reject(refreshError);
        }
      }
      
      // Handle other common error codes
      if (error.response?.status === 403) {
        console.error('Permission denied: You do not have access to this resource');
      } else if (error.response?.status === 404) {
        console.error('Resource not found');
      } else if (error.response?.status === 500) {
        console.error('Server error: Please try again later');
      }

      return Promise.reject(error);
    }
  );
};

// Export pre-configured HTTP methods for easier use
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => instance.get<T>(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => instance.post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => instance.put<T>(url, data, config),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => instance.patch<T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => instance.delete<T>(url, config),
};

export default instance;