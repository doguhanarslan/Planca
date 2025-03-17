import axios from '@/utils/axios';
import { isAxiosError } from 'axios';
import { 
  LoginCredentials, 
  RegisterUserData, 
  BusinessData, 
  ApiResponse, 
  AuthResponse 
} from '@/types';
import { fetchCurrentUser } from './authSlice';

/**
 * Authentication service containing all API calls for auth functionality
 */
class AuthService {
  // Auth endpoint constants
  private static readonly ENDPOINTS = {
    LOGIN: '/Auth/login',
    REGISTER: '/Auth/register',
    CREATE_BUSINESS: '/Auth/create-business',
    REFRESH_TOKEN: '/Auth/refresh-token',
    CURRENT_USER: '/Auth/current-user',
    LOGOUT: '/Auth/logout',
  };

  /**
   * Log in a user with email and password
   * @param credentials - User credentials
   * @returns Promise with the login result
   */
  static async login(credentials: LoginCredentials) {
    try {
      return await axios.post<ApiResponse<AuthResponse>>(
        this.ENDPOINTS.LOGIN, 
        credentials, 
        { withCredentials: true }
      ).finally(()=>fetchCurrentUser());
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise with the registration result
   */
  static async register(userData: RegisterUserData) {
    try {
      // Make sure userData is properly formatted before sending
      const requestData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        phoneNumber: userData.phoneNumber || ""
      };
      
      return await axios.post<ApiResponse<AuthResponse>>(
        this.ENDPOINTS.REGISTER, 
        requestData, 
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Create a business for the logged-in user
   * @param businessData - Business data
   * @returns Promise with the business creation result
   */
  static async createBusiness(businessData: BusinessData) {
    try {
      return await axios.post<ApiResponse<any>>(
        this.ENDPOINTS.CREATE_BUSINESS, 
        businessData, 
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Business creation error:', error);
      throw error;
    }
  }

  /**
   * Refresh the authentication token
   * @returns Promise with the token refresh result
   */
  static async refreshToken() {
    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(
        this.ENDPOINTS.REFRESH_TOKEN,
        {}, // Empty body since the token is in the cookie
        { withCredentials: true }
      );
      
      return response;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Token refresh failed:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        // If the token is invalid/expired, we should clear local state
        if (error.response?.status === 401 || error.response?.status === 400) {
          console.warn('Authentication expired, redirecting to login...');
          // Don't throw here - return a standardized error object
          return {
            data: {
              succeeded: false,
              message: 'Your session has expired. Please log in again.'
            }
          } as any;
        }
      }
      throw error;
    }
  }
  /**
   * Get the currently logged-in user
   * @returns Promise with the current user data
   */
  static async getCurrentUser() {
    try {
      return await axios.get<ApiResponse<AuthResponse>>(
        this.ENDPOINTS.CURRENT_USER, 
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Log out the current user
   * @returns Promise with the logout result
   */
  static async logout() {
    try {
      return await axios.post<ApiResponse<null>>(
        this.ENDPOINTS.LOGOUT, 
        {}, 
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}

// Export individual functions for backwards compatibility
export const login = AuthService.login.bind(AuthService);
export const register = AuthService.register.bind(AuthService);
export const createBusiness = AuthService.createBusiness.bind(AuthService);
export const refreshToken = AuthService.refreshToken.bind(AuthService);
export const getCurrentUser = AuthService.getCurrentUser.bind(AuthService);
export const logout = AuthService.logout.bind(AuthService);

// Export the service class for more advanced usage
export default AuthService;