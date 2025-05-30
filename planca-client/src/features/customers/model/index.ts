// Re-export all types
export * from './types';

// Re-export hooks
export { default as useCustomersFilters } from '../lib/hooks/useCustomersFilters';

// Constants
export const CUSTOMER_SORT_OPTIONS = [
  { value: 'lastName', label: 'Soyisme göre', ascending: 'A-Z', descending: 'Z-A' },
  { value: 'firstName', label: 'İsme göre', ascending: 'A-Z', descending: 'Z-A' },
  { value: 'email', label: 'E-postaya göre', ascending: 'A-Z', descending: 'Z-A' },
  { value: 'createdAt', label: 'Kayıt tarihine göre', ascending: 'Eskiden yeniye', descending: 'Yeniden eskiye' },
] as const;

export const DEFAULT_PAGE_SIZE = 6;
export const DEFAULT_SORT_BY = 'lastName';
export const DEFAULT_SORT_ASCENDING = true;

// Validation helpers
export const validateCustomerData = (data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}) => {
  const errors: Record<string, string> = {};

  if (!data.firstName?.trim()) {
    errors.firstName = 'Ad gereklidir';
  }

  if (!data.lastName?.trim()) {
    errors.lastName = 'Soyad gereklidir';
  }

  if (!data.email?.trim()) {
    errors.email = 'E-posta gereklidir';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Geçerli bir e-posta adresi girin';
  }

  if (data.phoneNumber && !/^[\d\s\(\)\-\+]+$/.test(data.phoneNumber)) {
    errors.phoneNumber = 'Geçerli bir telefon numarası girin';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Utility functions
export const formatCustomerName = (customer: { firstName?: string; lastName?: string; fullName?: string }) => {
  if (customer.fullName) return customer.fullName;
  return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'İsimsiz Müşteri';
};

export const getCustomerInitials = (customer: { firstName?: string; lastName?: string; fullName?: string }) => {
  const name = formatCustomerName(customer);
  const words = name.split(' ').filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  } else if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return 'MÜ';
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const numbers = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX XX XX
  if (numbers.length >= 10) {
    return `(${numbers.substring(0, 3)}) ${numbers.substring(3, 6)} ${numbers.substring(6, 8)} ${numbers.substring(8, 10)}`;
  }
  
  return phone;
}; 