import { FC, ReactNode, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCurrentUser } from '@/features/auth/authSlice';
import { setupAuthInterceptors } from '@/shared/api/base/axios';
import store from '@/app/store';
import LoadingScreen from '@/shared/ui/components/LoadingScreen';

const AuthInitializer: FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated  } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        setupAuthInterceptors(store);
        
        if (!isAuthenticated) {
          await dispatch(fetchCurrentUser());
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    initAuth();
  }, [dispatch, isAuthenticated]);
  
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  return <>{children}</>;
};

export default AuthInitializer; 