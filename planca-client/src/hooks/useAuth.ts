import { useCallback, useEffect, useMemo } from 'react';
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
 * Enhanced hook for authentication functionality
 * Provides optimized authentication methods and state access
 * @returns {Object} Authentication methods and state
 */
const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Check if the user is authenticated on mount, but only if we need to
  useEffect(() => {
    if (!auth.user && !auth.loading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, auth.user, auth.loading]);

  // Optimized login function with useCallback
  const login = useCallback(
    (credentials: LoginCredentials) => dispatch(loginUser(credentials)).then(()=>{
      dispatch(fetchCurrentUser());
    }),
    [dispatch]
  );

  // Optimized register function with useCallback
  const register = useCallback(
    (userData: RegisterUserData) => dispatch(registerUser(userData)),
    [dispatch]
  );

  // Optimized create business function with useCallback
  const createBusiness = useCallback(
    (businessData: BusinessData) => dispatch(createBusinessForUser(businessData)).then(() => {
      // After successful business creation, fetch updated user data 
      dispatch(fetchCurrentUser());
    }),
    [dispatch]
  );

  // Optimized logout function with useCallback
  const logout = useCallback(
    () => dispatch(logoutUser()),
    [dispatch]
  );

  // Optimized refresh token function with useCallback
  const refreshToken = useCallback(
    () => dispatch(refreshUserToken()),
    [dispatch]
  );

  // Memoized auth state to prevent unnecessary re-renders
  const authState = useMemo(() => ({
    // Authentication state
    user: auth.user,
    tenant: auth.tenant,
    isAuthenticated: auth.isAuthenticated,
    isBusinessRegistered: auth.isBusinessRegistered,
    loading: auth.loading,
    error: auth.error,
  }), [auth.user, auth.tenant, auth.isAuthenticated, auth.isBusinessRegistered, auth.loading, auth.error]);

  return {
    ...authState,
    // Authentication methods
    login,
    register,
    createBusiness,
    logout,
    refreshToken,
  };
};

export default useAuth;