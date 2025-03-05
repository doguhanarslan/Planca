// src/app/dashboard/page.tsx
'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useRouter } from 'next/navigation';
import { store } from '../../store';
import { useAppSelector } from '../../store';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAppSelector(state => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Provider store={store}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="mb-8">Welcome back, {user?.userName}!</p>
        
        <DashboardContent />
      </div>
    </Provider>
  );
}