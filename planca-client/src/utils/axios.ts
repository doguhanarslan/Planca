import axios, { 
  AxiosInstance, 
  AxiosError, 
  InternalAxiosRequestConfig,
} from "axios";
import { Store } from "@reduxjs/toolkit";
import { refreshUserToken, logoutUser } from "@/features/auth/authSlice";
// Define the backend API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000/api";

/**
 * Create a pre-configured Axios instance for app-wide use
 */
const instance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': "application/json",
  },
  withCredentials: true, // This ensures cookies are sent with every request
});

// Store Redux dispatch function for use in interceptors

/**
 * Initialize the Axios instance with Redux store and configure interceptors
 * @param store - Redux store reference
 */
export const initializeAxios = (store: Store): void => {

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const state = store.getState();
      
      // Add tenant ID if available in state
      if (state.auth?.tenant?.id) {
        config.headers.set("X-TenantId", state.auth.tenant.id);
      }
      // If we have the token in Redux state, set it in the Authorization header
      
      
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
      console.error("Request preparation failed:", error.message);
      return Promise.reject(error);
    }
  );

  // Response interceptor for token refresh and error handling
  
      
     
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Refresh token endpoint'ini çağır
          await axios.post("/auth/refresh-token", {}, { withCredentials: true });
          return instance(originalRequest); // İsteği tekrarla
        } catch (refreshError) {
          // Refresh token da geçersizse kullanıcıyı logout yap
        }
      }
      return Promise.reject(error);
    }
  );

  // Additional logging interceptor
  instance.interceptors.response.use(
    (response) => {
      console.log(`Response from ${response.config.url}:`, {
        status: response.status,
        hasData: !!response.data,
      });
      return response;
    },
    (error) => Promise.reject(error)
  );
}

export default instance;