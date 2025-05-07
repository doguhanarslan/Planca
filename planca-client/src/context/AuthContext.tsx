// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { api } from '../services/authService';

interface User {
  id: string;
  userName: string;
  email: string;
  roles: string[];
  tenantId?: string;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  createBusiness: (businessData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on app initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        // Don't set error on initial load to avoid showing error messages
        // when a user is simply not logged in
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.login(email, password);
      setUser(userData);
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.[0] || 'Failed to login. Please check your credentials.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      const registeredUser = await authService.register(userData);
      setUser(registeredUser);
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.[0] || 'Registration failed. Please try again.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
      // Force logout locally even if server request fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const createBusiness = async (businessData: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.createBusiness(businessData);
      
      // Get updated user data with tenant information
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors?.[0] || 'Failed to create business.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, createBusiness }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};