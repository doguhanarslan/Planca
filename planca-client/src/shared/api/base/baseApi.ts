// src/shared/api/baseApi.ts
import { createApi, fetchBaseQuery, BaseQueryApi, FetchArgs } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: 'https://localhost:7100/api',
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
    'Business'
  ],
  endpoints: () => ({}),
});

export default baseApi;