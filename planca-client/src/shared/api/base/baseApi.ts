// src/shared/api/baseApi.ts
import { createApi, fetchBaseQuery, BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';
// Base query with authentication - Environment variable support
const baseQuery = fetchBaseQuery({
  baseUrl: (window as any).ENV?.VITE_API_URL || import.meta.env.VITE_API_URL || '/api',
  credentials: 'include', // Cookie-based auth
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    
    // Add tenant ID if available
    if (state.auth?.tenant?.id) {
      headers.set('X-TenantId', state.auth.tenant.id);
    }
    
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    
    return headers;
  },
});

// Base query with token refresh logic
const baseQueryWithReauth = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: object) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshResult = await baseQuery(
      {
        url: '/Auth/refresh-token',
        method: 'POST',
        body: {},
      },
      api,
      extraOptions
    );
    
    if (refreshResult.data) {
      // Retry the original query after successful refresh
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, redirect to login
      api.dispatch({ type: 'auth/logoutUser/fulfilled' });
    }
  }
  
  return result;
};

// Create the base API slice
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Service', 
    'Customer', 
    'Employee', 
    'Appointment',
    'Auth',
    'Business',
    'Dashboard',
    'Settings',
    'BusinessSettings',
    'BookingSettings',
    'NotificationSettings'
  ],
  // Keep cache for 5 minutes but enable automatic refetching
  keepUnusedDataFor: 300,
  // Enable refetch on focus and reconnect for better UX
  refetchOnFocus: true,
  refetchOnReconnect: true,
  // Configure for immediate updates
  refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
  endpoints: () => ({}),
});

// Helper function to invalidate related caches
export const invalidateRelatedTags = (entityType: 'Service' | 'Customer' | 'Employee' | 'Appointment' | 'Auth' | 'Business' | 'Dashboard', entityId?: string) => {
  const tagsToInvalidate: Array<string | { type: string; id: string }> = [
    entityType,
    { type: entityType, id: 'LIST' },
  ];
  
  if (entityId) {
    tagsToInvalidate.push({ type: entityType, id: entityId });
  }
  
  // For appointments, also invalidate related entities
  if (entityType === 'Appointment') {
    tagsToInvalidate.push('Customer', 'Employee', 'Service');
  }
  
  return tagsToInvalidate;
};

export default baseApi;