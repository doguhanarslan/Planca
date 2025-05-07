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
      console.log('Attempting to refresh token');
      const response = await axios.post<ApiResponse<AuthResponse>>(
        this.ENDPOINTS.REFRESH_TOKEN, 
        {}, // Boş body, HTTP-only cookie otomatik olarak gönderilecek
        { withCredentials: true }
      );
      
      console.log('Token refresh response status:', response.status);
      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      if (isAxiosError(error) && error.response?.status === 401) {
        console.log('Refresh token is invalid or expired');
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
      console.log('Making getCurrentUser API request');
      // Auth cookie will be sent automatically with withCredentials: true
      const response = await axios.get<ApiResponse<AuthResponse>>(
        this.ENDPOINTS.CURRENT_USER,
        { withCredentials: true }
      );
      
      // Log response for debugging
      console.log('getCurrentUser response status:', response.status);
      console.log('getCurrentUser has data:', !!response.data);
      
      return response;
    } catch (error) {
      console.error('Get current user error:', error);
      
      // 401 Unauthorized hatası alındığında hata fırlat
      // Bu, Redux'ta rejected durumu tetikleyecek
      if (isAxiosError(error) && error.response?.status === 401) {
        console.log('User is not authenticated, rejecting with error');
      }
      
      // Tüm hataları fırlat
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