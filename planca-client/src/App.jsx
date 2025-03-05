import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';

// Auth components
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import BusinessRegistration from './features/auth/BusinessRegistration';
import Dashboard from './features/dashboard/Dashboard';

// Route protection components
import ProtectedRoute from './components/common/ProtectedRoute';
import BusinessRequiredRoute from './components/common/BusinessRequiredRoute';

function App() {
  return (
    <Provider store={store}>
      <Router>
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
            {/* Add more business routes here */}
          </Route>
          
          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;