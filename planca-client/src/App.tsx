import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/app/store';
import { fetchCurrentUser } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { AuthState } from '@/types';

// Auth components
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import BusinessRegistration from '@/features/auth/BusinessRegistration';
import Dashboard from '@/features/dashboard/Dashboard';

// Route protection components
import ProtectedRoute from '@/components/common/ProtectedRoute';
import BusinessRequiredRoute from '@/components/common/BusinessRequiredRoute';

// Layout component
import AppLayout from '@/components/layouts/AppLayout';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  // Explicitly type the state selector return type
  const { loading } = useAppSelector((state): AuthState => state.auth);

  // Check user info when app starts
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (
    loading &&
    window.location.pathname !== "/login" &&
    window.location.pathname !== "/register"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
          <p className="text-center mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route path="/create-business" element={<BusinessRegistration />} />
      </Route>

      {/* Business required routes - require authentication and a registered business */}
      <Route element={<BusinessRequiredRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Placeholder routes for future development */}
        <Route
          path="/appointments"
          element={
            <AppLayout>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Appointments
                </h1>
                <p className="text-gray-600">
                  This page is under development.
                </p>
              </div>
            </AppLayout>
          }
        />

        <Route
          path="/customers"
          element={
            <AppLayout>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Customers
                </h1>
                <p className="text-gray-600">
                  This page is under development.
                </p>
              </div>
            </AppLayout>
          }
        />

        <Route
          path="/services"
          element={
            <AppLayout>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Services
                </h1>
                <p className="text-gray-600">
                  This page is under development.
                </p>
              </div>
            </AppLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <AppLayout>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Settings
                </h1>
                <p className="text-gray-600">
                  This page is under development.
                </p>
              </div>
            </AppLayout>
          }
        />
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;