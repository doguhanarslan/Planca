// src/services/authService.ts

import axios from 'axios';

// Create an axios instance
const API_URL = 'https://localhost:7100/api'; // Update to match your API URL
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // Important: This ensures cookies are sent with requests
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
// Store callbacks to retry failed requests
let failedRequestsQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: any;
}[] = [];

// Process queued requests with new token
const processQueue = (error: any = null) => {
  failedRequestsQueue.forEach(request => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(api(request.config));
    }
  });
  
  failedRequestsQueue = [];
};

// Add an interceptor to handle token expiration
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If the error is not 401 or the request was already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Set a flag to prevent duplicate retries
    originalRequest._retry = true;

    // If we're already refreshing, add to queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    isRefreshing = true;

    try {
      // Call refresh endpoint (your API already handles cookies)
      await axios.post(
        `https://localhost:7100/api/Auth/refresh-token`, 
        {}, 
        { withCredentials: true }
      );
      
      // Process queued requests
      processQueue();
      
      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      // If refresh fails, process queue with error
      processQueue(refreshError);
      
      // Redirect to login page
      handleAuthFailure();
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Authentication actions
const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/Auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/Auth/register', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/Auth/logout');
    
    // Clear any local state
    localStorage.removeItem('user');
    
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/Auth/current-user');
    return response.data;
  },
  
  createBusiness: async (businessData: any) => {
    const response = await api.post('/Auth/create-business', businessData);
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await api.post('/Auth/refresh-token', {});
    return response.data;
  }
};

// Helper function to redirect to login on auth failures
const handleAuthFailure = () => {
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Export the API instance to use for other API calls
export { api };

// Export auth methods
export default authService;