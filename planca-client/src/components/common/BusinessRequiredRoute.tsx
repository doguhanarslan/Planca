import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

/**
 * Modern Protected route that requires both authentication and a registered business
 * Redirects to create-business if authenticated but no business
 * Redirects to login if not authenticated
 */
const BusinessRequiredRoute: React.FC = () => {
  const { isAuthenticated, isBusinessRegistered, loading } = useAuth();
  const location = useLocation();

  // Enhanced loading state with modern pulse effect
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-secondary-900 transition-colors duration-300">
        <div className="relative flex">
          {/* Main spinner */}
          <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-primary-600 dark:border-primary-400 animate-spin"></div>
          
          {/* Pulsing background effect */}
          <div className="absolute inset-0 rounded-full bg-primary-100 dark:bg-primary-900 opacity-30 animate-ping"></div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary-600 dark:bg-primary-300"></div>
          </div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm font-medium animate-pulse">
          Yükleniyor...
        </p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to business registration if authenticated but no business
  if (!isBusinessRegistered) {
    return <Navigate to="/create-business" state={{ from: location }} replace />;
  }

  // Render child routes
  return <Outlet />;
};

export default BusinessRequiredRoute;