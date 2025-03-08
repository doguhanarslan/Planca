import React, { useEffect, Suspense } from 'react';
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

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-secondary-900">
    <div className="max-w-md w-full p-6 text-center">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-3 border-b-3 border-primary-600 dark:border-primary-500"></div>
      </div>
      <p className="text-center mt-4 text-gray-600 dark:text-gray-300 font-medium">Yükleniyor...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state): AuthState => state.auth);
  const location = useLocation();

  // Check user info when app starts
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Check if current route is public
  const isPublicRoute = 
    location.pathname === "/" || 
    location.pathname === "/login" || 
    location.pathname === "/register";

  if (loading && !isPublicRoute) {
    return <LoadingScreen />;
  }

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

        {/* Placeholder routes for future development */}
        <Route
          path="/appointments"
          element={
            <AppLayout>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">
                  Randevular
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Bu sayfa geliştirme aşamasındadır.
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
                <h1 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">
                  Müşteriler
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Bu sayfa geliştirme aşamasındadır.
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
                <h1 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">
                  Hizmetler
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Bu sayfa geliştirme aşamasındadır.
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
                <h1 className="text-2xl font-bold text-gray-900 mb-4 dark:text-white">
                  Ayarlar
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
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
          <AppContent />
        </Suspense>
      </Router>
    </Provider>
  );
}

export default App;