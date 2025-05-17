import React, { useEffect, Suspense, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/app/store';
import { fetchCurrentUser } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { AuthState } from '@/types';
import '@/utils/constants';
import '@/styles/designSystem';

// Token yenileme ve kimlik doğrulama sistemi import
import { setupAuthInterceptors } from '@/utils/axios';

// Auth components
import Login from '@/features/auth/Login';
import Register from '@/features/auth/Register';
import BusinessRegistration from '@/features/auth/BusinessRegistration';
import Dashboard from '@/features/dashboard/Dashboard';

// Home components
import HomePage from '@/features/home/HomePage';

// Route protection components
import ProtectedRoute from '@/components/common/ProtectedRoute';
import BusinessRequiredRoute from '@/components/common/BusinessRequiredRoute';

// Layout component
import AppLayout from '@/components/layouts/AppLayout';

// Import Services component
import Services from '@/features/services/Services';

// Import Customers component
import Customers from '@/features/customers/Customers';

// Import Employees component
import Employees from '@/features/employees/Employees';

// Import Appointments component
import Appointments from '@/features/appointments/Appointments';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="max-w-md w-full p-6 text-center">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-3 border-b-3 border-red-600"></div>
      </div>
      <p className="text-center mt-4 text-black font-medium">Yükleniyor...</p>
    </div>
  </div>
);

// Auth initializer component
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Setup auth interceptors
        setupAuthInterceptors(store);
        
        // Only fetch current user if not already authenticated
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

// Main application content
const AppContent: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, isBusinessRegistered } = useAppSelector((state) => state.auth);
  
  // Redirect logic for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      // If on login/register page and authenticated, redirect
      if (['/login', '/register'].includes(location.pathname)) {
        if (isBusinessRegistered) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/create-business';
        }
      }
    }
  }, [isAuthenticated, isBusinessRegistered, location.pathname]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route path="/create-business" element={<BusinessRegistration />} />
      </Route>

      {/* Business required routes - require authentication and a registered business */}
      <Route element={<BusinessRequiredRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Services route */}
        <Route path="/services" element={<Services />} />
        
        {/* Customers routes */}
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:customerId" element={<Customers />} />
        
        {/* Employees routes */}
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:employeeId" element={<Employees />} />
        <Route path="/employees/new" element={<Employees />} />
        
        {/* Appointments routes */}
        <Route path="/appointments" element={
          <AppLayout>
            <Appointments />
          </AppLayout>
        } />
        
        {/* Route for creating appointment for a specific customer */}
        <Route
          path="/appointments/create/:customerId"
          element={
            <AppLayout>
              <Appointments />
            </AppLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <AppLayout>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-black mb-4">
                  Ayarlar
                </h1>
                <p className="text-black">
                  Bu sayfa geliştirme aşamasındadır.
                </p>
              </div>
            </AppLayout>
          }
        />
      </Route>

      {/* Redirects */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <AuthInitializer>
            <AppContent />
          </AuthInitializer>
        </Suspense>
      </Router>
    </Provider>
  );
}

export default App;