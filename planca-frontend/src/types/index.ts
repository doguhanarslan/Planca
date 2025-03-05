// AuthTypes
export interface User {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
}

export interface AuthState {
  userData: User | null;
  businessData: TenantData | null;
  isAuthenticated: boolean;
  registrationStep: number;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: string;
  userName: string;
  email: string;
  roles: string[];
}

// TenantTypes
export interface TenantData {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
  primaryColor: string;
  isActive: boolean;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  workingHours: WorkingHour[];
}

export interface WorkingHour {
  day: number;
  openTime: string;
  closeTime: string;
}

export interface CreateBusinessRequest {
  name: string;
  subdomain: string;
  logoUrl?: string;
  primaryColor?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  workSchedule: WorkingHour[];
}

// API Response Types
export interface ApiResponse<T> {
  succeeded: boolean;
  data: T;
  errors?: string[];
  message?: string;
}