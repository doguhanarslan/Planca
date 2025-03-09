import React from "react";

// User Types
export interface User {
  id?: string;
  email: string;
  name?: string;
  firstName: string;
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
  openTime: string;
  closeTime: string;
  breakStart?: string; // Mola başlangıç saati
  breakEnd?: string; // Mola bitiş saati
  isClosed?: boolean; // Kapalı günler için bayrak
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
  token?: string;
  refreshToken?: string;
  expiresAt?: string;
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
  icon: React.ReactNode;
  badge?: string | number; // Bildirim badgeleri için
  submenu?: NavigationItem[]; // Alt menüler için
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
export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' | 'ghost' | 'link' | 'customRed';
  size?: ComponentSize;
  onClick?: () => void;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode; // Sağ taraf için ikon
  fullWidth?: boolean;
  rounded?: RadiusSize;
  elevated?: boolean; // Yükseltilmiş gölge efekti
  active?: boolean; // Aktif durumu
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
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  description?: string; // Alan açıklaması
  validation?: 'success' | 'warning' | 'error'; // Doğrulama durumu
  showCharCount?: boolean; // Karakter sayısını göster
}

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string | React.ReactNode;
  onClose?: () => void;
  className?: string;
  autoClose?: boolean;
  autoCloseTime?: number;
  showIcon?: boolean; // İkon göster/gizle
  dismissible?: boolean; // Kapatılabilir
  elevated?: boolean; // Yükseltilmiş görünüm
  variant?: 'solid' | 'outline' | 'light'; // Stil varyantları
}

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  titleClassName?: string;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  shadow?: ShadowSize;
  padding?: PaddingSize;
  border?: boolean;
  rounded?: RadiusSize;
  hover?: boolean;
  transparent?: boolean;
  variant?: 'default' | 'primary' | 'secondary' | 'outline'; // Kart varyantları
  clickable?: boolean; // Tıklanabilir kart
  headerImage?: string; // Başlık resmi URL'si
  badges?: React.ReactNode; // Başlık üzerinde rozetler
}

export interface AppLayoutProps {
  children: React.ReactNode;
}