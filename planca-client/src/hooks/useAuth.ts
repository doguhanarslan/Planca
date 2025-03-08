import { useCallback, useEffect } from 'react';
import { 
  loginUser, 
  registerUser,
  createBusinessForUser,
  fetchCurrentUser,
  logoutUser, 
  refreshUserToken 
} from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { LoginCredentials, RegisterUserData, BusinessData } from '@/types';

/**
 * Custom hook for authentication functionality
 * @returns {Object} Authentication methods and state
 */
const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Check if the user is authenticated on mount
  useEffect(() => {
    if (!auth.user && !auth.loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, auth.user, auth.loading]);

  // Login function
  const login = useCallback(
    (credentials: LoginCredentials) => dispatch(loginUser(credentials)),
    [dispatch]
  );

  // Register function
  const register = useCallback(
    (userData: RegisterUserData) => dispatch(registerUser(userData)),
    [dispatch]
  );

  // Create business function
  const createBusiness = useCallback(
    (businessData: BusinessData) => dispatch(createBusinessForUser(businessData)),
    [dispatch]
  );

  // Logout function
  const logout = useCallback(
    () => dispatch(logoutUser()),
    [dispatch]
  );

  // Refresh token function
  const refreshToken = useCallback(
    () => dispatch(refreshUserToken()),
    [dispatch]
  );

  return {
    // Authentication state
    user: auth.user,
    tenant: auth.tenant,
    isAuthenticated: auth.isAuthenticated,
    isBusinessRegistered: auth.isBusinessRegistered,
    loading: auth.loading,
    error: auth.error,

    // Authentication methods
    login,
    register,
    createBusiness,
    logout,
    refreshToken,
  };
};

export default useAuth;