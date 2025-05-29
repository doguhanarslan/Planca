import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

export const useAuthRedirects = () => {
  const location = useLocation();
  const { isAuthenticated, isBusinessRegistered } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      if (['/login', '/register'].includes(location.pathname)) {
        if (isBusinessRegistered) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/create-business';
        }
      }
    }
  }, [isAuthenticated, isBusinessRegistered, location.pathname]);
}; 