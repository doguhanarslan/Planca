import { AppDispatch } from '@/app/store';
import { baseApi } from '@/shared/api/base/baseApi';
import { appointmentsApi } from '../../features/appointments/api/appointmentsAPI';
import { employeesApi } from '../../features/employees/api/employeesAPI';
import { customersApi } from '../../features/customers/api/customersAPI';
import { servicesApi } from '../../features/services/api/servicesAPI';

// RTK Query tag types
type TagType = 'Service' | 'Customer' | 'Employee' | 'Appointment' | 'Auth' | 'Business' | 'Dashboard';
type TagDescription = TagType | { type: TagType; id?: string | number };

export interface CacheInvalidationOptions {
  dispatch: AppDispatch;
  tags?: TagDescription[];
  delay?: number;
  refetchQueries?: (() => Promise<any>)[];
}

/**
 * Global cache invalidation utility
 * Bu fonksiyon tüm sayfalarda tutarlı cache invalidation sağlar
 */
export const invalidateCache = async ({
  dispatch,
  tags = [],
  delay = 100,
  refetchQueries = []
}: CacheInvalidationOptions): Promise<void> => {
  try {
    console.log('🔄 Starting cache invalidation...', { tags });
    
    // Force invalidate specified tags
    if (tags.length > 0) {
      dispatch(baseApi.util.invalidateTags(tags));
    }
    
    // Wait for cache invalidation to complete
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Execute additional refetch queries
    if (refetchQueries.length > 0) {
      await Promise.allSettled(refetchQueries.map(refetch => refetch()));
    }
    
    console.log('✅ Cache invalidation completed');
  } catch (error) {
    console.error('❌ Cache invalidation failed:', error);
    throw error;
  }
};

/**
 * Randevular için özel cache invalidation
 */
export const invalidateAppointmentCache = (dispatch: any) => {
  console.log('🔄 Invalidating appointment cache...');
  
  dispatch(appointmentsApi.util.invalidateTags([
    { type: 'Appointment', id: 'LIST' },
    'Appointment',
    'Dashboard',
    'Employee',
    'Customer'
  ]));
};

/**
 * Invalidate specific appointment cache entries
 */
export const invalidateSpecificAppointmentCache = (dispatch: any, appointmentId: string) => {
  console.log('🔄 Invalidating specific appointment cache:', appointmentId);
  
  dispatch(appointmentsApi.util.invalidateTags([
    { type: 'Appointment', id: appointmentId },
    { type: 'Appointment', id: 'LIST' },
    'Dashboard'
  ]));
};

/**
 * Prefetch appointments for better performance
 */
export const prefetchAppointments = (dispatch: any, params: any) => {
  console.log('⚡ Prefetching appointments...');
  
  dispatch(appointmentsApi.util.prefetch('getAppointments', params, { 
    force: false 
  }));
};

/**
 * Force refresh appointments with cache bypass
 */
export const forceRefreshAppointments = (dispatch: any, params: any) => {
  console.log('💥 Force refreshing appointments with cache bypass...');
  
  // Invalidate current cache
  dispatch(appointmentsApi.util.invalidateTags(['Appointment']));
  
  // Trigger new request with bypass cache
  dispatch(appointmentsApi.util.prefetch('getAppointments', {
    ...params,
    bypassCache: true
  }, { 
    force: true 
  }));
};

/**
 * Optimize cache for better performance
 */
export const optimizeCache = (dispatch: any) => {
  console.log('🚀 Optimizing cache...');
  
  // Clear stale cache entries
  dispatch(baseApi.util.invalidateTags(['Appointment', 'Employee', 'Customer', 'Service']));
  
  // Reset query data for fresh start
  dispatch(baseApi.util.resetApiState());
};

/**
 * Preload critical data for better UX
 */
export const preloadCriticalData = (dispatch: any) => {
  console.log('🔥 Preloading critical data...');
  
  // Preload today's appointments
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  dispatch(appointmentsApi.util.prefetch('getAppointments', {
    startDate: startOfToday.toISOString(),
    endDate: endOfToday.toISOString(),
    pageSize: 50
  }, { force: false }));
  
  // Preload active employees
  dispatch(employeesApi.util.prefetch('getActiveEmployees', undefined, { force: false }));
  
  // Preload active services
  dispatch(servicesApi.util.prefetch('getActiveServices', undefined, { force: false }));
};

/**
 * Handle cache after successful mutation
 */
export const handlePostMutationCache = (dispatch: any, mutationType: 'create' | 'update' | 'delete') => {
  console.log('✅ Handling post-mutation cache:', mutationType);
  
  switch (mutationType) {
    case 'create':
    case 'update':
      // Invalidate list caches but keep individual appointment caches
      dispatch(appointmentsApi.util.invalidateTags([
        { type: 'Appointment', id: 'LIST' },
        'Dashboard'
      ]));
      break;
    case 'delete':
      // More aggressive invalidation for delete operations
      dispatch(appointmentsApi.util.invalidateTags([
        'Appointment',
        'Dashboard',
        'Employee',
        'Customer'
      ]));
      break;
  }
};

/**
 * Get cache statistics for debugging
 */
export const getCacheStats = (state: any) => {
  const apiState = state.api;
  const queries = apiState?.queries || {};
  const mutations = apiState?.mutations || {};
  
  const stats = {
    totalQueries: Object.keys(queries).length,
    totalMutations: Object.keys(mutations).length,
    appointmentQueries: Object.keys(queries).filter(key => key.includes('Appointment')).length,
    cachedAppointments: 0
  };
  
  // Count cached appointments
  Object.values(queries).forEach((query: any) => {
    if (query?.data && Array.isArray(query.data)) {
      stats.cachedAppointments += query.data.length;
    } else if (query?.data?.items && Array.isArray(query.data.items)) {
      stats.cachedAppointments += query.data.items.length;
    }
  });
  
  console.log('📊 Cache Stats:', stats);
  return stats;
};

/**
 * Müşteriler için özel cache invalidation
 */
export const invalidateCustomerCache = async (dispatch: AppDispatch, refetchQueries: (() => Promise<any>)[] = []) => {
  return invalidateCache({
    dispatch,
    tags: ['Customer', 'Dashboard'],
    refetchQueries
  });
};

/**
 * Çalışanlar için özel cache invalidation
 */
export const invalidateEmployeeCache = async (dispatch: AppDispatch, refetchQueries: (() => Promise<any>)[] = []) => {
  return invalidateCache({
    dispatch,
    tags: ['Employee', 'Dashboard', 'Appointment'],
    refetchQueries
  });
};

/**
 * Hizmetler için özel cache invalidation
 */
export const invalidateServiceCache = async (dispatch: AppDispatch, refetchQueries: (() => Promise<any>)[] = []) => {
  return invalidateCache({
    dispatch,
    tags: ['Service', 'Dashboard'],
    refetchQueries
  });
};

/**
 * Dashboard için özel cache invalidation
 */
export const invalidateDashboardCache = async (dispatch: AppDispatch, refetchQueries: (() => Promise<any>)[] = []) => {
  return invalidateCache({
    dispatch,
    tags: ['Dashboard', 'Appointment', 'Customer', 'Employee'],
    refetchQueries
  });
};

/**
 * Tüm cache'i temizleme (acil durum)
 */
export const invalidateAllCache = async (dispatch: AppDispatch) => {
  try {
    console.log('🧹 Clearing all cache...');
    dispatch(baseApi.util.resetApiState());
    console.log('✅ All cache cleared');
  } catch (error) {
    console.error('❌ Failed to clear all cache:', error);
    throw error;
  }
}; 