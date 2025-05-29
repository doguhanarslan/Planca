import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

/**
 * Modern Protected route component with enhanced loading state
 * Redirects to login if not authenticated
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Enhanced loading state with modern spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-secondary-900">
        <div className="relative">
          {/* Outer spinner ring */}
          <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-primary-500 dark:border-primary-400 animate-spin"></div>
          {/* Inner spinner ring */}
          <div className="w-12 h-12 rounded-full border-t-4 border-b-4 border-primary-300 dark:border-primary-600 animate-spin absolute top-2 left-2"></div>
          {/* Center dot */}
          <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-300 absolute top-7 left-7"></div>
        </div>
      </div>
    );
  }

  // Redirect to login ONLY if loading is complete and user is not authenticated
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default ProtectedRoute;