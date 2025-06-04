// Public API
export * from './api';

// Types and models
export * from './model';

// Re-export for backward compatibility
export {
  useGetDashboardStatsQuery as useDashboardStats,
  useGetTodayAppointmentsQuery as useTodayAppointments,
} from './api';