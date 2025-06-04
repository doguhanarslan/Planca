// src/features/dashboard/model/index.ts

import { DashboardFilters } from './types';

// Re-export all types
export * from './types';

// Dashboard utility functions
export const formatDashboardValue = (value: number, type: 'currency' | 'number' | 'percentage'): string => {
  switch (type) {
    case 'currency':
      return `₺${value.toLocaleString('tr-TR')}`;
    case 'percentage':
      return `${value}%`;
    case 'number':
    default:
      return value.toLocaleString('tr-TR');
  }
};

// Calculate trend percentage
export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Get trend direction and color
export const getTrendInfo = (trend: number) => {
  if (trend > 0) {
    return {
      direction: 'up' as const,
      color: 'text-green-600',
      icon: '↗',
      label: `+${trend}%`
    };
  } else if (trend < 0) {
    return {
      direction: 'down' as const,
      color: 'text-red-600',
      icon: '↘',
      label: `${trend}%`
    };
  } else {
    return {
      direction: 'neutral' as const,
      color: 'text-gray-600',
      icon: '→',
      label: '0%'
    };
  }
};

// Default dashboard layout configuration
export const DEFAULT_DASHBOARD_LAYOUT = {
  widgets: [
    {
      id: 'stats',
      type: 'stats' as const,
      title: 'Genel Bakış',
      enabled: true,
      order: 1,
      size: 'large' as const,
    },
    {
      id: 'today-appointments',
      type: 'today-appointments' as const,
      title: 'Bugünkü Randevular',
      enabled: true,
      order: 2,
      size: 'medium' as const,
    },
    {
      id: 'business-info',
      type: 'business-info' as const,
      title: 'İşletme Bilgileri',
      enabled: true,
      order: 3,
      size: 'medium' as const,
    },
  ],
  columns: 2,
  spacing: 'normal' as const,
};

// Dashboard periods configuration
export const DASHBOARD_PERIODS = [
  { value: 'day', label: 'Bugün' },
  { value: 'week', label: 'Bu Hafta' },
  { value: 'month', label: 'Bu Ay' },
  { value: 'year', label: 'Bu Yıl' },
] as const;

// Validation helpers
export const validateDashboardFilters = (filters: DashboardFilters) => {
  const errors: Record<string, string> = {};

  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    errors.dateRange = 'Başlangıç tarihi bitiş tarihinden sonra olamaz';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Dashboard data helpers
export const getEmptyDashboardStats = () => ({
  totalAppointments: 0,
  upcomingAppointments: 0,
  customersCount: 0,
  revenueThisMonth: 0,
});

export const getDefaultDashboardData = () => ({
  stats: getEmptyDashboardStats(),
  todayAppointments: [],
  isLoading: false,
  error: null,
});