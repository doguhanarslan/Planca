import { useCallback, useEffect, useState } from 'react';
import { 
  loginUser, 
  registerUser,
  createBusinessForUser,
  fetchCurrentUser,
  logoutUser
} from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { LoginCredentials, RegisterUserData, BusinessData } from '@/shared/types';

/**
 * Enhanced hook for authentication functionality using cookie authentication
 * @returns {Object} Authentication methods and state
 */
const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Check if the user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!auth.user && !auth.loading && !authChecked) {
        try {
          console.log('Checking authentication status...');
          await dispatch(fetchCurrentUser()).unwrap();
          setAuthChecked(true);
        } catch (err) {
          console.error('Authentication check failed:', err);
          setAuthChecked(true);
        }
      } else if (auth.user) {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [dispatch, auth.user, auth.loading, authChecked]);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const result = await dispatch(loginUser(credentials)).unwrap();
      // After login is successful, fetch the current user to get updated data
      if (result?.succeeded) {
        await dispatch(fetchCurrentUser()).unwrap();
      }
      return result;
    },
    [dispatch]
  );

  // Register function
  const register = useCallback(
    async (userData: RegisterUserData) => {
      const result = await dispatch(registerUser(userData)).unwrap();
      // After registration is successful, fetch the current user
      if (result?.succeeded) {
        await dispatch(fetchCurrentUser()).unwrap();
      }
      return result;
    },
    [dispatch]
  );

  // Create business function
  const createBusiness = useCallback(
    async (businessData: BusinessData) => {
      const result = await dispatch(createBusinessForUser(businessData)).unwrap();
      // After business creation, refresh user data
      if (result?.succeeded) {
        await dispatch(fetchCurrentUser()).unwrap();
      }
      return result;
    },
    [dispatch]
  );

  // Logout function
  const logout = useCallback(
    () => dispatch(logoutUser()),
    [dispatch]
  );

  return {
    user: auth.user,
    tenant: auth.tenant,
    isAuthenticated: auth.isAuthenticated,
    isBusinessRegistered: auth.isBusinessRegistered,
    loading: auth.loading,
    error: auth.error,
    authChecked,
    login,
    register,
    createBusiness,
    logout
  };
};

export default useAuth;