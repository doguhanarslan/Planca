import axios from 'axios';
import { refreshUserToken } from '../features/auth/authSlice';

// Create an Axios instance with a base URL
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5288/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // HTTP-only cookies için önemli
});

// Store for Redux dispatch function
let storeDispatch = null;

// Function to initialize the Axios instance with Redux store
export const initializeAxios = (store) => {
  storeDispatch = store.dispatch;

  // Tenant ID'sini header'a ekleyen interceptor
  instance.interceptors.request.use(
    (config) => {
      const state = store.getState();
      if (state.auth.tenant?.id) {
        config.headers['X-TenantId'] = state.auth.tenant.id;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Token yenileme için response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Error 401 ise ve henüz retry yapmamışsak
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Token'ı yenile
          await storeDispatch(refreshUserToken());
          
          // Orjinal isteği tekrarla (token HttpOnly cookie içinde otomatik olarak eklenir)
          return instance(originalRequest);
        } catch (refreshError) {
          // Token yenileme başarısız olduysa
          console.error('Token yenileme başarısız:', refreshError);
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default instance;