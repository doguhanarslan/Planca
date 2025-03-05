import axios from 'axios';
import { refreshUserToken } from '../features/auth/authSlice';

// Create an Axios instance with a base URL
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5288/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling cookies
});

// Store for Redux dispatch function
let storeDispatch = null;

// Function to initialize the Axios instance with Redux store
export const initializeAxios = (store) => {
  storeDispatch = store.dispatch;

  // Add a response interceptor to handle token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If the error is 401 Unauthorized and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          await storeDispatch(refreshUserToken());
          
          // Retry the original request with the new token
          // Since we're using HttpOnly cookies, the token should be automatically included
          return instance(originalRequest);
        } catch (refreshError) {
          // If token refresh fails, pass the error to the application
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default instance;