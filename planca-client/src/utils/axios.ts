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
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Essential for HttpOnly cookies
  timeout: 30000, // 30 second timeout
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
          // Try to refresh the token
          const result = await storeDispatch(refreshUserToken());
          
          // Check if token refresh was successful
          if (result.payload && result.payload.token) {
            console.log("Token refresh successful, retrying request");
            // Set the new token in the header for the retry
            originalRequest.headers.Authorization = `Bearer ${result.payload.token}`;
            return instance(originalRequest);
          } else {
            // Token refresh returned but without a new token
            console.error("Token refresh failed: No new token received");
            await storeDispatch(logout());
            return Promise.reject({
              ...error,
              message: "Authentication failed. Please log in again."
            });
          }
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          // Log out the user on refresh failure
          await storeDispatch(logout());
          return Promise.reject({
            ...error,
            message: "Authentication expired. Please log in again."
          });
        }
      }

      // Handle 400 errors from token refresh endpoint specifically
      if (error.response.status === 400 && 
          originalRequest.url?.includes("/Auth/refresh-token")) {
        console.error("Refresh token is invalid or expired");
        await storeDispatch(logout());
        return Promise.reject({
          ...error,
          message: "Your session has expired. Please log in again."
        });
      }

      // Handle other error statuses
      switch (error.response.status) {
        case 403:
          console.error("Permission denied: You don't have access to this resource");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 400:
          console.error("Bad request:", error.response.data);
          break;
        case 500:
          console.error("Server error, please try again later");
          break;
        default:
          console.error(`Request failed with status ${error.response.status}`);
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Pre-configured HTTP methods with type safety
 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.get<T>(url, config),
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    instance.post<T>(url, data, config),
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    instance.put<T>(url, data, config),
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    instance.patch<T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    instance.delete<T>(url, config),
};

export default instance;

/**
 * Logs out the user by dispatching a logout action to the Redux store
 * Called when authentication fails or tokens expire
 */
function logout(): any {
  if (!storeDispatch) {
    console.error('Unable to logout: Redux store not initialized');
    return Promise.reject(new Error('Store not initialized'));
  }
  
  // Dispatch logout action from auth slice
  return storeDispatch({ type: 'auth/logout' });
}
