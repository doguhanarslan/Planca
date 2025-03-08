// User Types
export interface User {
    id: string;
    email: string;
    name?: string;
    firstName: string;
    lastName: string;
    roles: string[];
  }
  
  // Tenant/Business Types
  export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    logoUrl?: string;
    primaryColor?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    workSchedule?: WorkSchedule[];
    [key: string]: any; // For additional properties
  }
  
  export interface WorkSchedule {
    day: number;
    openTime: string;
    closeTime: string;
  }
  
  // Authentication Types
  export interface AuthState {
    user: User | null;
    tenant: Tenant | null;
    isAuthenticated: boolean;
    isBusinessRegistered: boolean;
    loading: boolean;
    error: string[] | string | null;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
  }
  
  export interface RegisterUserData {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }
  
  export interface BusinessData {
    name: string;
    subdomain: string;
    logoUrl?: string;
    primaryColor?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    workSchedule: WorkSchedule[];
  }
  
  // API Response Types
  export interface ApiResponse<T> {
    succeeded: boolean;
    data: T;
    errors?: string[];
    message?: string;
  }
  
  export interface AuthResponse {
    userId: string;
    email: string;
    userName?: string;
    firstName: string;
    lastName: string;
    roles?: string[];
    tenantId?: string;
    tenantName?: string;
    tenant?: Tenant;
  }
  
  // Stats Types
  export interface DashboardStats {
    totalAppointments: number;
    upcomingAppointments: number;
    customersCount: number;
    revenueThisMonth: number;
  }
  
  // Navigation Items
  export interface NavigationItem {
    name: string;
    href: string;
    icon: React.ReactNode;
  }
  
  // Component Props Types
  export interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    disabled?: boolean;
    children?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' | 'ghost' | 'customRed';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    onClick?: () => void;
    isLoading?: boolean;
    loadingText?: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  }
  
  export interface InputProps {
    type?: string;
    name: string;
    id?: string;
    label?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    touched?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    containerClassName?: string;
    labelClassName?: string;
    helpText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
  }
  
  export interface AlertProps {
    type?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string | React.ReactNode;
    onClose?: () => void;
    className?: string;
    autoClose?: boolean;
    autoCloseTime?: number;
  }
  
  export interface CardProps {
    children?: React.ReactNode;
    className?: string;
    title?: React.ReactNode;
    titleClassName?: string;
    subtitle?: React.ReactNode;
    footer?: React.ReactNode;
    actions?: React.ReactNode;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    padding?: 'none' | 'sm' | 'normal' | 'lg' | 'xl';
    border?: boolean;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    hover?: boolean;
    transparent?: boolean;
  }
  
  export interface AppLayoutProps {
    children: React.ReactNode;
  }