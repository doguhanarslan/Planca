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

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Uygulama ilk yüklendiğinde auth interceptor'larını ve token kontrolünü başlat
    const initializeAuth = async () => {
      try {
        console.log('Token kontrolü ve interceptor\'lar başlatılıyor...');
        await setupAuthInterceptors(store);
        console.log('Token kontrolü ve interceptor\'lar başarıyla kuruldu');
      } catch (error) {
        console.error('Auth başlatma hatası:', error);
      } finally {
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  if (!authInitialized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state): AuthState => state.auth);
  const location = useLocation();
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // NOT: Redux store'daki abonelik zaten tenant değişikliklerini izliyor
  // Bu nedenle buraya ek izleme kodu eklemiyoruz, böylece sonsuz döngüleri önlüyoruz

  // Uygulama başladığında mevcut kullanıcı bilgilerini kontrol et
  useEffect(() => {
    // JWT token yenileme işlemi setupAuthInterceptors tarafından yapıldıktan sonra
    // kullanıcı bilgilerini al
    const getCurrentUserInfo = async () => {
      try {
        console.log('Kullanıcı bilgileri alınıyor...');
        await dispatch(fetchCurrentUser());
        console.log('Kullanıcı bilgileri başarıyla alındı.');
      } catch (error) {
        console.log('Kullanıcı giriş yapmamış veya oturum süresi dolmuş.');
      } finally {
        // Mark auth check as completed regardless of the result
        setAuthInitialized(true);
      }
    };

    if (!authInitialized) {
      getCurrentUserInfo();
    }
  }, [dispatch, authInitialized]);

  // Şu anki rotanın public olup olmadığını kontrol et
  const isPublicRoute = 
    location.pathname === "/" || 
    location.pathname === "/login" || 
    location.pathname === "/register";

  // During the initial loading and on protected routes, show loading screen
  if (!authInitialized && !isPublicRoute) {
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
        
        {/* Services route */}
        <Route path="/services" element={<Services />} />
        
        {/* Customers routes */}
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:customerId" element={<Customers />} />
        
        {/* Placeholder routes for future development */}
        <Route
          path="/appointments"
          element={
            <AppLayout>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-black mb-4">
                  Randevular
                </h1>
                <p className="text-black">
                  Bu sayfa geliştirme aşamasındadır.
                </p>
              </div>
            </AppLayout>
          }
        />
        
        {/* Route for creating appointment for a specific customer */}
        <Route
          path="/appointments/create/:customerId"
          element={
            <AppLayout>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-black mb-4">
                  Create Appointment
                </h1>
                <p className="text-black">
                  This page for creating appointments is under development.
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