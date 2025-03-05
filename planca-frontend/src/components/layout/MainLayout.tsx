// src/components/layout/MainLayout.tsx
import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCurrentUser } from '../../store/slices/authSlice';

interface MainLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, requireAuth = false }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Try to fetch current user on component mount
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    // Redirect if not authenticated and requireAuth is true
    if (!isLoading && !isAuthenticated && requireAuth) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;