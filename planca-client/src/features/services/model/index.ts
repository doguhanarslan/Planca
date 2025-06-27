// Re-export all types
export * from './types';

// Re-export hooks
export { default as useServicesFilters } from '../lib/hooks/useServicesFilters';

// Constants
export const SERVICE_SORT_OPTIONS = [
  { value: 'name', label: 'İsme göre', ascending: 'A-Z', descending: 'Z-A' },
  { value: 'price', label: 'Fiyata göre', ascending: 'Düşükten yükseğe', descending: 'Yüksekten düşüğe' },
  { value: 'durationMinutes', label: 'Süreye göre', ascending: 'Kısadan uzuna', descending: 'Uzundan kısaya' },
  { value: 'isActive', label: 'Duruma göre', ascending: 'Aktif önce', descending: 'Pasif önce' },
  { value: 'createdAt', label: 'Oluşturulma tarihine göre', ascending: 'Eskiden yeniye', descending: 'Yeniden eskiye' },
] as const;

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SORT_BY = 'name';
export const DEFAULT_SORT_ASCENDING = true;

// Service color options
export const SERVICE_COLOR_OPTIONS = [
  { value: 'blue', label: 'Mavi', hex: '#3B82F6' },
  { value: 'red', label: 'Kırmızı', hex: '#EF4444' },
  { value: 'green', label: 'Yeşil', hex: '#10B981' },
  { value: 'yellow', label: 'Sarı', hex: '#F59E0B' },
  { value: 'purple', label: 'Mor', hex: '#8B5CF6' },
  { value: 'pink', label: 'Pembe', hex: '#EC4899' },
  { value: 'indigo', label: 'İndigo', hex: '#6366F1' },
  { value: 'teal', label: 'Turkuaz', hex: '#14B8A6' },
  { value: 'orange', label: 'Turuncu', hex: '#F97316' },
  { value: 'gray', label: 'Gri', hex: '#6B7280' },
] as const;

// Validation helpers
export const validateServiceData = (data: {
  name?: string;
  price?: number;
  durationMinutes?: number;
  color?: string;
}) => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) {
    errors.name = 'Hizmet adı gereklidir';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Hizmet adı en az 2 karakter olmalıdır';
  }

  if (data.price === undefined || data.price === null) {
    errors.price = 'Fiyat gereklidir';
  } else if (data.price < 0) {
    errors.price = 'Fiyat negatif olamaz';
  }

  if (data.durationMinutes === undefined || data.durationMinutes === null) {
    errors.durationMinutes = 'Süre gereklidir';
  } else if (data.durationMinutes <= 0) {
    errors.durationMinutes = 'Süre pozitif bir değer olmalıdır';
  } else if (data.durationMinutes > 1440) {
    errors.durationMinutes = 'Süre 24 saatten fazla olamaz';
  }

  if (!data.color?.trim()) {
    errors.color = 'Renk seçimi gereklidir';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Utility functions
export const formatServiceName = (service: { name?: string }) => {
  return service.name?.trim() || 'İsimsiz Hizmet';
};

export const formatServicePrice = (price: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
};

export const formatServiceDuration = (durationMinutes: number): string => {
  if (durationMinutes < 60) {
    return `${durationMinutes} dk`;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (minutes === 0) {
    return `${hours} sa`;
  }
  
  return `${hours} sa ${minutes} dk`;
};

export const getServiceColorHex = (colorValue: string): string => {
  const colorOption = SERVICE_COLOR_OPTIONS.find(option => option.value === colorValue);
  return colorOption?.hex || '#6B7280';
};

export const getServiceStatusText = (isActive: boolean): string => {
  return isActive ? 'Aktif' : 'Pasif';
};

export const getServiceStatusColor = (isActive: boolean): string => {
  return isActive ? 'text-green-600' : 'text-gray-500';
}; 