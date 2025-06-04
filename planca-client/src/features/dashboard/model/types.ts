// src/features/dashboard/model/types.ts

import { AppointmentDto, DashboardStats } from '@/shared/types';
import React from 'react';

// Re-export shared dashboard types
export type { DashboardStats } from '@/shared/types';

// Dashboard-specific types
export interface DashboardData {
  stats: DashboardStats;
  todayAppointments: AppointmentDto[];
  isLoading: boolean;
  error: string | null;
}

export interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
  loading?: boolean;
}

export interface TodayAppointmentItemProps {
  appointment: AppointmentDto;
  index: number;
  isLast: boolean;
}

export interface BusinessInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
}

// Dashboard periods for analytics
export type DashboardPeriod = 'day' | 'week' | 'month' | 'year';

// Dashboard widget types
export type DashboardWidgetType = 
  | 'stats' 
  | 'today-appointments' 
  | 'business-info' 
  | 'analytics' 
  | 'recent-customers'
  | 'revenue-chart';

export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  title: string;
  enabled: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
  props?: Record<string, unknown>;
}

// Dashboard layout configuration
export interface DashboardLayoutConfig {
  widgets: DashboardWidget[];
  columns: number;
  spacing: 'compact' | 'normal' | 'comfortable';
}

// Dashboard filters
export interface DashboardFilters {
  period: DashboardPeriod;
  startDate?: Date;
  endDate?: Date;
  employeeIds?: string[];
  serviceIds?: string[];
  customerIds?: string[];
}

// Enhanced dashboard stats with trends
export interface EnhancedDashboardStats extends DashboardStats {
  trends: {
    appointmentsTrend: number;
    customersTrend: number;
    revenueTrend: number;
  };
  comparisons: {
    previousPeriod: DashboardStats;
  };
}

// Dashboard state selectors interface
export interface DashboardSelectors {
  selectDashboardStats: (tenantId: string) => DashboardStats | undefined;
  selectTodayAppointments: (tenantId: string) => AppointmentDto[];
  selectDashboardLoading: (tenantId: string) => boolean;
  selectDashboardError: (tenantId: string) => string | null;
}