import { ReactNode, ButtonHTMLAttributes, ChangeEvent, FocusEvent, HTMLAttributes } from 'react';

// User Types
export interface User {
  id?: string;
  email: string;
  name?: string;
  firstName: string;
  tenantId?: string;
  lastName: string;
  roles: string[];
  avatar?: string; // Kullanıcı avatarı için yeni alan
  preferences?: UserPreferences; // Kullanıcı tercihlerini saklamak için
}
// Kullanıcı tercihleri için yeni arayüz
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboardLayout?: 'compact' | 'comfortable' | 'spacious';
}

export type WorkingHour = WorkSchedule;
export type ColorVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'neutral';
export type ButtonStyle = 'solid' | 'outline' | 'ghost' | 'light' | 'link'; // 'link' eklendi

// Tenant/Business Types
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string; // İkincil renk seçeneği eklendi
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  workSchedule?: WorkSchedule[];
  contactEmail?: string; // İletişim bilgileri eklendi
  contactPhone?: string; 
  website?: string;
  socialMedia?: SocialMediaLinks;
  [key: string]: any; // For additional properties
}

// Sosyal medya bağlantıları için yeni arayüz
export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

export interface WorkSchedule {
  day: number;
  openTimeString: string;
  closeTimeString: string;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isBusinessRegistered: boolean;
  loading: boolean;
  error: string[] | string | null;
  lastLogin?: Date; // Son giriş tarihi
  refreshTokenExpiry?: Date; // Yenileme token süresi
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: string; // Cihaz bilgisi
}

export interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  confirmPassword?:string;
}

export interface BusinessData {
  name: string;
  subdomain: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  workSchedule: WorkSchedule[];
  industry?: string; // İşletme sektörü
  size?: 'small' | 'medium' | 'large'; // İşletme büyüklüğü
  description?: string; // İşletme açıklaması
}

// API Response Types
export interface ApiResponse<T> {
  succeeded: boolean;
  data: T;
  errors?: string[];
  message?: string;
  statusCode?: number; // HTTP durum kodu
  timestamp?: string; // Yanıt zaman damgası
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
  expiresAt?: string;
  refreshToken?: string;
  refreshTokenExpiryTime?: string;
}

// Stats Types
export interface DashboardStats {
  totalAppointments: number;
  upcomingAppointments: number;
  customersCount: number;
  revenueThisMonth: number;
  revenueGrowth?: number; // Gelir büyümesi
  averageRating?: number; // Ortalama değerlendirme
  completionRate?: number; // Tamamlanma oranı
  topServices?: Array<{name: string, count: number}>; // En popüler hizmetler
}

// Navigation Items
export interface NavigationItem {
  name: string;
  href: string;
  icon: ReactNode;
  badge?: string | number; // Bildirim badgeleri için
  submenu?: NavigationItem[]; // Alt menüler için
}
// Sidebar Props
export interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  navigation: NavigationItem[];
  user: User | null; // Make user prop explicit
}
// Modern component size options
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Modern shadow options
export type ShadowSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Modern radius options
export type RadiusSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Modern padding options
export type PaddingSize = 'none' | 'sm' | 'normal' | 'lg' | 'xl';

// Component Props Types
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  helpText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  maxLength?: number;
  autoComplete?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string | ReactNode;
  onClose?: () => void;
  className?: string;
  autoClose?: boolean;
  autoCloseTime?: number;
  showIcon?: boolean; // İkon göster/gizle
  dismissible?: boolean; // Kapatılabilir
  elevated?: boolean; // Yükseltilmiş görünüm
  variant?: 'solid' | 'outline' | 'light'; // Stil varyantları
}

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  titleClassName?: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'glow';
  padding?: 'none' | 'sm' | 'normal' | 'lg' | 'xl';
  border?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hover?: boolean | 'subtle' | 'lift' | 'glow';
  transparent?: boolean;
  variant?: 'solid' | 'glass' | 'gradient';
}

export interface AppLayoutProps {
  children: ReactNode;
}

// Add these new interfaces to the types file

// Service DTO representing a service in the system
export interface ServiceDto {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  color: string;
  tenantId: string;
  createdAt?: string;
  createdBy?: string;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

// CustomerDto interface matching backend model
export interface CustomerDto {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  notes?: string;
  tenantId?: string;
}

// AddressDto interface can be deleted
// AppointmentDto interface for appointments
export interface AppointmentDto {
  id: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  serviceId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  tenantId?: string;
}

// Paginated response from the API
export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Only add this if it doesn't already exist in the file
/* 
export interface ApiResponse<T = any> {
  succeeded: boolean;
  message?: string;
  errors?: string[];
  data: T;
}
*/

// Employee DTO representing an employee in the system
export interface EmployeeDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  title?: string;
  isActive: boolean;
  serviceIds: string[];
  workingHours: WorkingHoursDto[];
  tenantId?: string;
}

export interface WorkingHoursDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorkingDay: boolean;
}