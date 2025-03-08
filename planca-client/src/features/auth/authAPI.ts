import axios from '@/utils/axios';
import { 
  LoginCredentials, 
  RegisterUserData, 
  BusinessData, 
  ApiResponse, 
  AuthResponse 
} from '@/types';

// Authentication endpoints
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CREATE_BUSINESS: '/auth/create-business',
  REFRESH_TOKEN: '/auth/refresh-token',
  CURRENT_USER: '/auth/current-user',
  LOGOUT: '/auth/logout',
};

/**
 * Log in a user with email and password
 * @param credentials - User credentials
 * @returns Promise with the login result
 */
export const login = (credentials: LoginCredentials) => {
  return axios.post<ApiResponse<AuthResponse>>(
    AUTH_ENDPOINTS.LOGIN, 
    credentials, 
    { withCredentials: true }
  );
};

/**
 * Register a new user
 * @param userData - User registration data
 * @returns Promise with the registration result
 */
export const register = (userData: RegisterUserData) => {
  return axios.post<ApiResponse<AuthResponse>>(
    AUTH_ENDPOINTS.REGISTER, 
    userData, 
    { withCredentials: true }
  );
};

/**
 * Create a business for the logged-in user
 * @param businessData - Business data
 * @returns Promise with the business creation result
 */
export const createBusiness = (businessData: BusinessData) => {
  return axios.post<ApiResponse<any>>(
    AUTH_ENDPOINTS.CREATE_BUSINESS, 
    businessData, 
    { withCredentials: true }
  );
};

/**
 * Refresh the authentication token
 * @returns Promise with the token refresh result
 */
export const refreshToken = () => {
  return axios.post<ApiResponse<AuthResponse>>(
    AUTH_ENDPOINTS.REFRESH_TOKEN, 
    {}, 
    { withCredentials: true }
  );
};

/**
 * Get the currently logged-in user
 * @returns Promise with the current user data
 */
export const getCurrentUser = () => {
  return axios.get<ApiResponse<AuthResponse>>(
    AUTH_ENDPOINTS.CURRENT_USER, 
    { withCredentials: true }
  );
};

/**
 * Log out the current user
 * @returns Promise with the logout result
 */
export const logout = () => {
  return axios.post<ApiResponse<null>>(
    AUTH_ENDPOINTS.LOGOUT, 
    {}, 
    { withCredentials: true }
  );
};