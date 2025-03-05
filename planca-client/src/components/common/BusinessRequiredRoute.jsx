import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * Protected route that requires both authentication and a registered business
 * Redirects to create-business if authenticated but no business
 * Redirects to login if not authenticated
 */
const BusinessRequiredRoute = () => {
  const { isAuthenticated, isBusinessRegistered, loading } = useAuth();
  const location = useLocation();

  // Show loading state if authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
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