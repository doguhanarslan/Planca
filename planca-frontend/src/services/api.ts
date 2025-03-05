import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthResponse, ApiResponse } from '@/types';
import { getCookie, setCookie } from 'cookies-next';

class ApiClient {
  private api: AxiosInstance;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = getCookie('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (!this.tokenRefreshPromise) {
            this.tokenRefreshPromise = this.refreshToken();
          }
          
          try {
            const newToken = await this.tokenRefreshPromise;
            this.tokenRefreshPromise = null;
            originalRequest._retry = true;
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            
            return this.api(originalRequest);
          } catch (refreshError) {
            this.tokenRefreshPromise = null;
            // Redirect to login page
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = getCookie('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        { refreshToken }
      );
      
      if (response.data.succeeded) {
        const { token, refreshToken: newRefreshToken } = response.data.data;
        setCookie('auth_token', token);
        setCookie('refresh_token', newRefreshToken);
        return token;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      throw error;
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  private handleApiError<T>(error: any): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      const errorResponse = error.response?.data;
      return {
        succeeded: false,
        data: {} as T,
        errors: errorResponse?.errors || ['An error occurred'],
        message: errorResponse?.message || error.message
      };
    }
    
    return {
      succeeded: false,
      data: {} as T,
      errors: ['An unexpected error occurred']
    };
  }
}

const apiClient = new ApiClient();
export default apiClient;