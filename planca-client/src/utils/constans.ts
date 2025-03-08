// src/utils/constants.ts
import { ReactNode } from 'react';
import { WorkingHour } from '../types';

/**
 * Uygulama genelinde kullanılan sabitler
 */

// Kimlik doğrulama endpoint'leri
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CREATE_BUSINESS: '/auth/create-business',
  REFRESH_TOKEN: '/auth/refresh-token',
  CURRENT_USER: '/auth/current-user',
  LOGOUT: '/auth/logout',
} as const;

// Uygulama rotaları
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  CREATE_BUSINESS: '/create-business',
  DASHBOARD: '/dashboard',
  APPOINTMENTS: '/appointments',
  CUSTOMERS: '/customers',
  SERVICES: '/services',
  SETTINGS: '/settings',
} as const;

// Form doğrulama mesajları
export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string): string => `${field} gereklidir`,
  MIN_LENGTH: (field: string, length: number): string => `${field} en az ${length} karakter olmalıdır`,
  MAX_LENGTH: (field: string, length: number): string => `${field} en fazla ${length} karakter olmalıdır`,
  EMAIL: 'Geçerli bir e-posta adresi giriniz',
  PASSWORD_MATCH: 'Şifreler eşleşmiyor',
  PASSWORD_UPPERCASE: 'Şifre en az bir büyük harf içermelidir',
  PASSWORD_LOWERCASE: 'Şifre en az bir küçük harf içermelidir',
  PASSWORD_NUMBER: 'Şifre en az bir rakam içermelidir',
} as const;

// Gezinme öğeleri
interface NavigationItem {
  name: string;
  href: string;
  icon: ReactNode;
}

// Gezinme öğeleri
export const NAVIGATION_ITEMS: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: ROUTES.DASHBOARD, 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  { 
    name: 'Randevular', 
    href: ROUTES.APPOINTMENTS, 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    name: 'Müşteriler', 
    href: ROUTES.CUSTOMERS, 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  { 
    name: 'Hizmetler', 
    href: ROUTES.SERVICES, 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )
  },
  { 
    name: 'Ayarlar', 
    href: ROUTES.SETTINGS, 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

// Haftanın günleri
interface DayOfWeek {
  value: number;
  label: string;
}

export const DAYS_OF_WEEK: DayOfWeek[] = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

// Varsayılan uygulama ayarları
export const DEFAULT_CONFIG = {
  // Varsayılan çalışma saatleri (9:00 - 17:00, Pazartesi - Cuma)
  workSchedule: DAYS_OF_WEEK
    .filter(day => day.value >= 1 && day.value <= 5)
    .map(day => ({
      day: day.value,
      openTime: '09:00',
      closeTime: '17:00'
    } as WorkingHour)),
  
  // Varsayılan birincil marka rengi
  primaryColor: '#3498db'
} as const;

// Local storage anahtarları
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'planca_auth_token',
  USER: 'planca_user',
  TENANT: 'planca_tenant',
  THEME: 'planca_theme'
} as const;