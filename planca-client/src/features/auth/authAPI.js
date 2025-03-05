import axios from '../../utils/axios';

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
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise} Promise with the login result
 */
export const login = (credentials) => {
  return axios.post(AUTH_ENDPOINTS.LOGIN, credentials, { withCredentials: true });
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} Promise with the registration result
 */
export const register = (userData) => {
  return axios.post(AUTH_ENDPOINTS.REGISTER, userData, { withCredentials: true });
};

/**
 * Create a business for the logged-in user
 * @param {Object} businessData - Business data
 * @returns {Promise} Promise with the business creation result
 */
export const createBusiness = (businessData) => {
  return axios.post(AUTH_ENDPOINTS.CREATE_BUSINESS, businessData, { withCredentials: true });
};

/**
 * Refresh the authentication token
 * @returns {Promise} Promise with the token refresh result
 */
export const refreshToken = () => {
  return axios.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {}, { withCredentials: true });
};

/**
 * Get the currently logged-in user
 * @returns {Promise} Promise with the current user data
 */
export const getCurrentUser = () => {
  return axios.get(AUTH_ENDPOINTS.CURRENT_USER, { withCredentials: true });
};

/**
 * Log out the current user
 * @returns {Promise} Promise with the logout result
 */
export const logout = () => {
  // For now, this is a placeholder since the backend might not have a logout endpoint yet
  // We'll implement this based on how the backend handles logout
  // Typically, it would invalidate the refresh token and clear the HttpOnly cookies
  return axios.post(AUTH_ENDPOINTS.LOGOUT, {}, { withCredentials: true });
};