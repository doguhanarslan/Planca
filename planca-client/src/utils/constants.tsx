// src/utils/constants.ts
import { ReactNode } from 'react';
import { WorkingHour } from '../types';

/**
 * Uygulama genelinde kullanılan sabitler, modern bir yapıda organize edildi
 */

// API Endpoint Sabitleri
export const API = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    CREATE_BUSINESS: '/auth/create-business',
    REFRESH_TOKEN: '/auth/refresh-token',
    CURRENT_USER: '/auth/current-user',
    LOGOUT: '/auth/logout',
  },
  APPOINTMENTS: {
    BASE: '/appointments',
    GET_BY_ID: (id: string) => `/appointments/${id}`,
    CREATE: '/appointments/create',
    UPDATE: (id: string) => `/appointments/${id}`,
    DELETE: (id: string) => `/appointments/${id}`,
  },
  CUSTOMERS: {
    BASE: '/customers',
    GET_BY_ID: (id: string) => `/customers/${id}`,
    CREATE: '/customers/create',
    UPDATE: (id: string) => `/customers/${id}`,
    DELETE: (id: string) => `/customers/${id}`,
  },
  SERVICES: {
    BASE: '/services',
    GET_BY_ID: (id: string) => `/services/${id}`,
    CREATE: '/services/create',
    UPDATE: (id: string) => `/services/${id}`,
    DELETE: (id: string) => `/services/${id}`,
  },
} as const;

// Uygulama Rota Sabitleri
export const ROUTES = {
  // Public routes
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    ABOUT: '/about',
    CONTACT: '/contact',
    PRIVACY: '/privacy',
    TERMS: '/terms',
  },
  // Auth required routes
  AUTH: {
    CREATE_BUSINESS: '/create-business',
  },
  // Business required routes
  BUSINESS: {
    DASHBOARD: '/dashboard',
    APPOINTMENTS: '/appointments',
    CUSTOMERS: '/customers',
    SERVICES: '/services',
    SETTINGS: '/settings',
    PROFILE: '/profile',
    ANALYTICS: '/analytics',
    EMPLOYEES: '/employees',
  }
} as const;

// Form Validation Mesajları
export const VALIDATION = {
  REQUIRED: (field: string): string => `${field} gereklidir`,
  MIN_LENGTH: (field: string, length: number): string => `${field} en az ${length} karakter olmalıdır`,
  MAX_LENGTH: (field: string, length: number): string => `${field} en fazla ${length} karakter olmalıdır`,
  EMAIL: 'Geçerli bir e-posta adresi giriniz',
  PASSWORD: {
    MATCH: 'Şifreler eşleşmiyor',
    UPPERCASE: 'Şifre en az bir büyük harf içermelidir',
    LOWERCASE: 'Şifre en az bir küçük harf içermelidir',
    NUMBER: 'Şifre en az bir rakam içermelidir',
    SPECIAL: 'Şifre en az bir özel karakter içermelidir',
    MIN_LENGTH: 'Şifre en az 8 karakter olmalıdır',
  },
  PHONE: 'Geçerli bir telefon numarası giriniz',
} as const;

// Gezinme Öğeleri İçin Arayüz
interface NavigationItem {
  name: string;
  href: string;
  icon: ReactNode;
  badge?: {
    text: string;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  };
}

// Ana Navigasyon Öğeleri
export const NAVIGATION = {
  MAIN: [
    { 
      name: 'Dashboard', 
      href: ROUTES.BUSINESS.DASHBOARD, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Randevular', 
      href: ROUTES.BUSINESS.APPOINTMENTS, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Müşteriler', 
      href: ROUTES.BUSINESS.CUSTOMERS, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      name: 'Personeller', 
      href: ROUTES.BUSINESS.EMPLOYEES, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      name: 'Hizmetler', 
      href: ROUTES.BUSINESS.SERVICES, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      name: 'Analytics', 
      href: ROUTES.BUSINESS.ANALYTICS, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badge: {
        text: 'Yeni',
        color: 'primary'
      }
    },
    { 
      name: 'Ayarlar', 
      href: ROUTES.BUSINESS.SETTINGS, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ] as NavigationItem[],
  
  // Kullanıcı Menüsü Öğeleri
  USER: [
    {
      name: 'Profilim',
      href: ROUTES.BUSINESS.PROFILE,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'Ayarlar',
      href: ROUTES.BUSINESS.SETTINGS,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: 'Çıkış Yap',
      href: '#logout',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )
    }
  ] as NavigationItem[]
};

// Haftanın Günleri
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', shortLabel: 'Paz' },
  { value: 1, label: 'Monday', shortLabel: 'Pzt' },
  { value: 2, label: 'Tuesday', shortLabel: 'Sal' },
  { value: 3, label: 'Wednesday', shortLabel: 'Çar' },
  { value: 4, label: 'Thursday', shortLabel: 'Per' },
  { value: 5, label: 'Friday', shortLabel: 'Cum' },
  { value: 6, label: 'Saturday', shortLabel: 'Cmt' },
] as const;

// Varsayılan Uygulama Ayarları
export const DEFAULTS = {
  // Varsayılan çalışma saatleri (9:00 - 17:00, Pazartesi - Cuma)
  WORK_SCHEDULE: DAYS_OF_WEEK
    .filter(day => day.value >= 1 && day.value <= 5)
    .map(day => ({
      day: day.value,
      openTime: '09:00',
      closeTime: '17:00',
      openTimeString: '09:00',
      closeTimeString: '17:00'
    } as WorkingHour)),
  // Varsayılan birincil marka rengi
  PRIMARY_COLOR: '#ff0000',
  
  // Varsayılan sayfalama boyutu
  PAGE_SIZE: 10,
  
  // Varsayılan randevu süresi (dakika)
  APPOINTMENT_DURATION: 30,
  
  // Varsayılan tarih formatı
  DATE_FORMAT: 'DD.MM.YYYY',
  
  // Varsayılan zaman formatı
  TIME_FORMAT: 'HH:mm',
  
  // Varsayılan datetime formatı
  DATETIME_FORMAT: 'DD.MM.YYYY HH:mm',
  
  // Varsayılan dil
  LANGUAGE: 'tr',
};

// Local Storage Anahtarları
export const STORAGE = {
  AUTH_TOKEN: 'planca_auth_token',
  USER: 'planca_user',
  TENANT: 'planca_tenant',
  THEME: 'planca_theme',
  LANGUAGE: 'planca_language',
  LAST_ROUTE: 'planca_last_route',
} as const;

// Tema Modu Tipleri
export const THEME_MODES = {
  LIGHT: 'light',
} as const;

// HTTP İstek Durumları
export const REQUEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
} as const;

// Hata Kodları ve Mesajları
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: 'Oturum süreniz doldu, lütfen tekrar giriş yapın.',
  [ERROR_CODES.FORBIDDEN]: 'Bu işlemi gerçekleştirmek için yetkiniz bulunmamaktadır.',
  [ERROR_CODES.NOT_FOUND]: 'İstediğiniz kaynak bulunamadı.',
  [ERROR_CODES.SERVER_ERROR]: 'Sunucu hatası, lütfen daha sonra tekrar deneyin.',
  DEFAULT: 'Bir hata oluştu, lütfen daha sonra tekrar deneyin.',
} as const;