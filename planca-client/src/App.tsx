import { Suspense, FC } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/app/store';
import '@/shared/lib/constants/constants';
import '@/styles/designSystem';
// Auth components
import Login from '@/pages/login/Login';
import Register from '@/pages/register/Register';
import BusinessRegistration from '@/pages/businessregistration/BusinessRegistration';
import Dashboard from '@/pages/dashboard/Dashboard';

// Home components
import HomePage from '@/pages/home/HomePage';

// Route protection components
import ProtectedRoute from '@/routes/ProtectedRoute';
import BusinessRequiredRoute from '@/routes/BusinessRequiredRoute';

// Layout component
import AppLayout from '@/shared/ui/layouts/AppLayout';

// Import Services component
import Services from '@/pages/services/Services';

// Import Customers component
import Customers from '@/pages/customers/Customers';

// Import Employees component
import Employees from '@/pages/employees/Employees';

// Import Appointments component
import Appointments from '@/pages/appointments/Appointments';

// Import Settings component
import Settings from '@/pages/settings/Settings';

// Loading component
import LoadingScreen from '@/shared/ui/components/LoadingScreen';

// Auth initializer component
import AuthInitializer from '@/app/providers/AuthInitializer';
import { useAuthRedirects } from '@/features/auth/hooks/useAuthRedirects';

// Main application content
const AppContent: FC = () => {
  useAuthRedirects(); // Use the custom hook for redirects

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
              <Settings />
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