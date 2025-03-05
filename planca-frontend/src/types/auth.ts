// src/types/auth.ts
export interface User {
    id: string;
    email: string;
    userName: string;
    roles: string[];
  }
  
  export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    tenant: {
      id: string | null;
      name: string | null;
    };
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role?: string;
  }
  
  export interface AuthResponse {
    token: string;
    refreshToken: string;
    userId: string;
    userName: string;
    email: string;
    roles: string[];
  }