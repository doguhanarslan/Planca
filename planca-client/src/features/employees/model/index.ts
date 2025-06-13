// Re-export all types
export * from './types';

// Constants
export const EMPLOYEE_SORT_OPTIONS = [
  { value: 'lastName', label: 'Soyisme göre', ascending: 'A-Z', descending: 'Z-A' },
  { value: 'firstName', label: 'İsme göre', ascending: 'A-Z', descending: 'Z-A' },
  { value: 'email', label: 'E-postaya göre', ascending: 'A-Z', descending: 'Z-A' },
  { value: 'title', label: 'Ünvana göre', ascending: 'A-Z', descending: 'Z-A' },
  { value: 'createdAt', label: 'Kayıt tarihine göre', ascending: 'Eskiden yeniye', descending: 'Yeniden eskiye' },
] as const;

export const DEFAULT_PAGE_SIZE = 6;
export const DEFAULT_SORT_BY = 'lastName';
export const DEFAULT_SORT_ASCENDING = true;

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Pazartesi', shortLabel: 'Pzt' },
  { value: 2, label: 'Salı', shortLabel: 'Sal' },
  { value: 3, label: 'Çarşamba', shortLabel: 'Çar' },
  { value: 4, label: 'Perşembe', shortLabel: 'Per' },
  { value: 5, label: 'Cuma', shortLabel: 'Cum' },
  { value: 6, label: 'Cumartesi', shortLabel: 'Cmt' },
  { value: 7, label: 'Pazar', shortLabel: 'Paz' },
] as const;

// Validation helpers
export const validateEmployeeData = (data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  title?: string;
}) => {
  const errors: Record<string, string> = {};

  if (!data.firstName?.trim()) {
    errors.firstName = 'Ad gereklidir';
  } else if (data.firstName.length > 50) {
    errors.firstName = 'Ad en fazla 50 karakter olmalıdır';
  }

  if (!data.lastName?.trim()) {
    errors.lastName = 'Soyad gereklidir';
  } else if (data.lastName.length > 50) {
    errors.lastName = 'Soyad en fazla 50 karakter olmalıdır';
  }

  if (!data.email?.trim()) {
    errors.email = 'E-posta gereklidir';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Geçerli bir e-posta adresi girin';
  }

  if (data.phoneNumber && !/^[\d\s\(\)\-\+]+$/.test(data.phoneNumber)) {
    errors.phoneNumber = 'Geçerli bir telefon numarası girin';
  }

  if (data.title && data.title.length > 100) {
    errors.title = 'Ünvan en fazla 100 karakter olmalıdır';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Utility functions
export const formatEmployeeName = (employee: { firstName?: string; lastName?: string; fullName?: string }) => {
  if (employee.fullName) return employee.fullName;
  return `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'İsimsiz Personel';
};

export const getEmployeeInitials = (employee: { firstName?: string; lastName?: string; fullName?: string }) => {
  const name = formatEmployeeName(employee);
  const words = name.split(' ').filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  } else if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return 'PE';
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

export const getWorkingDaysCount = (employee: { workingHours?: Array<{ isWorkingDay: boolean }> }): number => {
  if (!employee.workingHours || employee.workingHours.length === 0) {
    return 0;
  }
  return employee.workingHours.filter(wh => wh.isWorkingDay).length;
};

export const formatWorkingHours = (workingHours: Array<{ dayOfWeek: number; startTime: string; endTime: string; isWorkingDay: boolean }>) => {
  const workingDays = workingHours.filter(wh => wh.isWorkingDay);
  if (workingDays.length === 0) return 'Çalışma saati belirtilmemiş';
  
  const dayName = DAYS_OF_WEEK.find(d => d.value === workingDays[0].dayOfWeek)?.shortLabel || '';
  if (workingDays.length === 1) {
    return `${dayName} ${workingDays[0].startTime}-${workingDays[0].endTime}`;
  }
  
  return `${workingDays.length} gün çalışıyor`;
}; 