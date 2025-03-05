// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../store';
import { fetchCurrentUser } from '../store/slices/authSlice';

export function useRequireAuth(redirectUrl = '/login') {
  const { isAuthenticated, isLoading, user } = useAppSelector(state => state.auth);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, redirectUrl, router]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading, user };
}

export function useRequireRole(role: string | string[], redirectUrl = '/dashboard') {
  const { isAuthenticated, isLoading, user } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const roles = Array.isArray(role) ? role : [role];
      const hasRole = roles.some(r => user.roles.includes(r));
      
      if (!hasRole) {
        router.push(redirectUrl);
      }
    }
  }, [isAuthenticated, isLoading, user, role, redirectUrl, router]);

  return { isAuthenticated, isLoading, user, hasRole: user ? 
    (Array.isArray(role) ? role.some(r => user.roles.includes(r)) : user.roles.includes(role)) 
    : false };
}