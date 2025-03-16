import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { refreshUserToken } from "@/features/auth/authSlice";
import { Store } from "@reduxjs/toolkit";

// Define the backend API URL - ensure this matches your actual backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000/api";

/**
 * Create a pre-configured Axios instance for app-wide use
 */
const instance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: "application/json",
  },
  withCredentials: true, // Essential for HttpOnly cookies
});

// Store Redux dispatch function for use in interceptors
let storeDispatch: any = null;

/**
 * Initialize the Axios instance with Redux store and configure interceptors
 * @param store - Redux store reference
 */
export const initializeAxios = (store: Store): void => {
  storeDispatch = store.dispatch;

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const state = store.getState();
      
      // Add tenant ID if available in state
      if (state.auth?.tenant?.id) {
        config.headers.set("X-TenantId", state.auth.tenant.id);
      }
      
      // Add token to authorization header - this might be needed
      // even with HttpOnly cookies in some server configurations
      if (state.auth?.token) {
        config.headers.set("Authorization", `Bearer ${state.auth.token}`);
      }
      
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
      console.error("Request preparation failed:", error.message);
      return Promise.reject(error);
    }
  );

  // Response interceptor for token refresh and error handling
  instance.interceptors.response.use(
    // Success handler
    (response) => response,
    
    // Error handler with token refresh logic
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
      
      // Handle network errors (no response)
      if (!error.response) {
        console.error("Network error: Please check your connection");
        return Promise.reject({
          ...error,
          message: "Network error: Please check your connection",
        });
      }
      
      // Special handling for 401 errors - attempt token refresh only once
      if (error.response.status === 401 && !originalRequest._retry) {
        console.log("Attempting to refresh token due to 401 error");
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token - with HTTP-only cookies we don't need to extract the token
          await instance.post('/Auth/refresh-token', {}, { withCredentials: true });
          
          // If we get here, refresh was successful - just retry the original request
          // No need to modify headers as the cookie is sent automatically
          console.log("Token refresh successful, retrying request");
          return instance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          
          // Log out the user on refresh failure
          await storeDispatch(logout());
          
          // Redirect to login page
          
          return Promise.reject({
            ...error,
            message: "Authentication expired. Please log in again."
          });
        }
      }
      
      // For other errors, just pass them through
      return Promise.reject(error);
    }
  );

/**
 * Pre-configured HTTP methods with type safety
 */
function logout(): any {
  if (!storeDispatch) {
    console.error('Unable to logout: Redux store not initialized');
    return Promise.reject(new Error('Store not initialized'));
  }
  
  // Dispatch logout action from auth slice
  return storeDispatch({ type: 'auth/logout' });
}
}
export default instance;
