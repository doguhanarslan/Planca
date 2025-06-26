import { baseApi } from '@/shared/api/base/baseApi';
import { ApiResponse, PaginatedList, AppointmentDto } from '@/shared/types';

// Transform query params to API format
const transformParams = (params: {
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  customerId?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}) => {
  const apiParams: Record<string, any> = {
    PageNumber: params.pageNumber || 1,
    PageSize: params.pageSize || 50,
    SortBy: params.sortBy || 'StartTime',
    SortDirection: params.sortDirection || 'asc',
    bypassCache: true, // Always bypass backend cache for real-time updates
    _t: Date.now(), // Cache busting for HTTP caching
  };

  if (params.startDate) {
    apiParams.StartDate = params.startDate;
  }
  
  if (params.endDate) {
    apiParams.EndDate = params.endDate;
  }
  
  if (params.employeeId) {
    apiParams.EmployeeId = params.employeeId;
  }
  
  if (params.customerId) {
    apiParams.CustomerId = params.customerId;
  }
  
  if (params.status) {
    apiParams.Status = params.status;
  }
  
  return apiParams;
};

// Transform appointment data for API
const transformAppointmentForApi = (appointment: Omit<AppointmentDto, 'id'> | AppointmentDto) => ({
  Id: 'id' in appointment ? appointment.id : undefined,
  CustomerId: appointment.customerId,
  EmployeeId: appointment.employeeId,
  ServiceId: appointment.serviceId,
  StartTime: appointment.startTime,
  EndTime: appointment.endTime,
  Status: appointment.status,
  Notes: appointment.notes,
  TenantId: appointment.tenantId,
});

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get appointments with pagination and filtering
    getAppointments: builder.query<PaginatedList<AppointmentDto> | AppointmentDto[], {
      startDate?: string;
      endDate?: string;
      employeeId?: string;
      customerId?: string;
      status?: string;
      pageNumber?: number;
      pageSize?: number;
      sortBy?: string;
      sortDirection?: 'asc' | 'desc';
      bypassCache?: boolean; // Add bypass cache support
    }>({
      query: (params) => {
        const transformedParams = transformParams(params);
        const searchParams = new URLSearchParams();
        
        // Add regular query parameters
        Object.entries(transformedParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
        
        // Add bypass cache parameter if specified
        if (params.bypassCache) {
          searchParams.append('bypassCache', 'true');
        }
        
        return {
          url: `/Appointments?${searchParams.toString()}`,
          headers: params.bypassCache ? {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          } : undefined
        };
      },
      transformResponse: (response: any) => {
        console.log('Get Appointments Response:', response);
        
        if (response?.data) {
          return response.data;
        } else if (response && ('items' in response || Array.isArray(response))) {
          return response;
        } else {
          return [];
        }
      },
      providesTags: (result) => {
        const tags = [{ type: 'Appointment' as const, id: 'LIST' }];
        
        if (result) {
          const appointments = Array.isArray(result) ? result : result.items || [];
          appointments.forEach(appointment => {
            tags.push({ type: 'Appointment' as const, id: appointment.id });
          });
        }
        
        return tags;
      },
      // Increase cache time for better page navigation experience  
      keepUnusedDataFor: 300,
    }),

    // Get single appointment by ID
    getAppointmentById: builder.query<AppointmentDto, string>({
      query: (id) => ({
        url: `/Appointments/${id}`,
      }),
      transformResponse: (response: ApiResponse<AppointmentDto>) => {
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'Appointment', id }],
    }),

    // Get appointments for specific employee
    getEmployeeAppointments: builder.query<
      AppointmentDto[], 
      { employeeId: string; startDate: string; endDate: string }
    >({
      query: ({ employeeId, startDate, endDate }) => ({
        url: `/Appointments/employee/${employeeId}`,
        params: { startDate, endDate },
      }),
      transformResponse: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          return [];
        }
      },
      providesTags: (result, error, { employeeId }) => [
        { type: 'Appointment', id: `employee-${employeeId}` },
        ...(result?.map(({ id }) => ({ type: 'Appointment' as const, id })) || []),
      ],
    }),

    // Get appointments for specific customer
    getCustomerAppointments: builder.query<
      AppointmentDto[], 
      { customerId: string; startDate?: string; endDate?: string }
    >({
      query: ({ customerId, startDate, endDate }) => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        
        return {
          url: `/Appointments/customer/${customerId}`,
          params,
        };
      },
      transformResponse: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          return [];
        }
      },
      providesTags: (result, error, { customerId }) => [
        { type: 'Appointment', id: `customer-${customerId}` },
        ...(result?.map(({ id }) => ({ type: 'Appointment' as const, id })) || []),
      ],
    }),

    // Get appointments for date and employee (for availability checking)
    getAppointmentsForDateAndEmployee: builder.query<
      AppointmentDto[], 
      { employeeId: string; date: string }
    >({
      query: ({ employeeId, date }) => {
        // Create start and end of the requested day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        return {
          url: `/Appointments/employee/${employeeId}`,
          params: { 
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        };
      },
      transformResponse: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        } else {
          return [];
        }
      },
      providesTags: (result, error, { employeeId, date }) => [
        { type: 'Appointment', id: `employee-${employeeId}-${date}` },
      ],
    }),

    // Create new appointment
    createAppointment: builder.mutation<AppointmentDto, Omit<AppointmentDto, 'id'>>({
      query: (appointmentData) => ({
        url: '/Appointments',
        method: 'POST',
        body: transformAppointmentForApi(appointmentData),
      }),
      transformResponse: (response: any) => {
        console.log('Create Appointment Response:', response);
        
        // Handle different response formats
        if (response?.data) {
          return response.data;
        } else if (response?.id) {
          return response;
        } else {
          throw new Error('Invalid response format');
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: 'Appointment', id: 'LIST' }, // Invalidate list cache
        'Appointment', // Invalidate all appointment queries
        'Dashboard', // Also invalidate dashboard stats
      ],
    }),

    // Update existing appointment
    updateAppointment: builder.mutation<AppointmentDto, AppointmentDto>({
      query: (appointmentData) => ({
        url: `/Appointments/${appointmentData.id}`,
        method: 'PUT',
        body: transformAppointmentForApi(appointmentData),
      }),
      // Add optimistic update
      onQueryStarted: async (appointmentData, { dispatch, queryFulfilled }) => {
        // Optimistically update all relevant queries
        const patchResults: any[] = [];
        
        try {
          // Update the main appointments list
          const listPatchResult = dispatch(
            appointmentsApi.util.updateQueryData('getAppointments', {}, (draft) => {
              if (Array.isArray(draft)) {
                const index = draft.findIndex(apt => apt.id === appointmentData.id);
                if (index !== -1) {
                  draft[index] = appointmentData;
                }
              } else if ('items' in draft) {
                const index = draft.items.findIndex(apt => apt.id === appointmentData.id);
                if (index !== -1) {
                  draft.items[index] = appointmentData;
                }
              }
            })
          );
          patchResults.push(listPatchResult);

          // Update employee-specific appointments
          const employeePatchResult = dispatch(
            appointmentsApi.util.updateQueryData(
              'getEmployeeAppointments',
              { 
                employeeId: appointmentData.employeeId,
                startDate: new Date(appointmentData.startTime).toISOString().split('T')[0],
                endDate: new Date(appointmentData.startTime).toISOString().split('T')[0]
              },
              (draft) => {
                const index = draft.findIndex(apt => apt.id === appointmentData.id);
                if (index !== -1) {
                  draft[index] = appointmentData;
                }
              }
            )
          );
          patchResults.push(employeePatchResult);

          await queryFulfilled;
        } catch {
          // Revert optimistic updates on error
          patchResults.forEach(patchResult => patchResult.undo());
        }
      },
      transformResponse: (response: any) => {
        console.log('Update Appointment Response:', response);
        
        if (response?.data) {
          return response.data;
        } else if (response?.id) {
          return response;
        } else {
          // If API doesn't return the updated appointment, return the input data
          return response;
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Appointment', id: 'LIST' }, // Invalidate list cache
        { type: 'Appointment', id }, // Invalidate specific appointment
        'Appointment', // Invalidate all appointment queries to be safe
        'Dashboard', // Also invalidate dashboard stats
        // Add employee and customer specific invalidations
        { type: 'Employee', id: result?.employeeId },
        { type: 'Customer', id: result?.customerId },
      ],
    }),

    // Cancel appointment
    cancelAppointment: builder.mutation<AppointmentDto, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/Appointments/${id}/cancel`,
        method: 'POST',
        body: { id, reason },
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        } else if (response?.id) {
          return response;
        } else {
          return response;
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Appointment', id: 'LIST' },
        { type: 'Appointment', id },
        'Appointment',
        'Dashboard',
      ],
    }),

    // Confirm appointment
    confirmAppointment: builder.mutation<AppointmentDto, string>({
      query: (id) => ({
        url: `/Appointments/${id}/confirm`,
        method: 'POST',
        body: {},
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        } else if (response?.id) {
          return response;
        } else {
          return response;
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Appointment', id: 'LIST' },
        { type: 'Appointment', id },
        'Appointment',
        'Dashboard',
      ],
    }),

    // Delete appointment
    deleteAppointment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/Appointments/${id}`,
        method: 'DELETE',
      }),
      // Enhanced optimistic update for immediate UI feedback
      onQueryStarted: async (id, { dispatch, queryFulfilled, getState }) => {
        console.log('🗑️ Starting enhanced optimistic delete for appointment:', id);
        
        // Store patch results for potential rollback
        const patchResults: any[] = [];
        
        try {
          // 1. Get all current query cache entries to update them optimistically
          const state = getState() as any;
          const apiState = state.api;
          
          // 2. Optimistically remove from ALL appointments list queries
          Object.keys(apiState.queries).forEach(queryKey => {
            if (queryKey.startsWith('getAppointments(')) {
              try {
                const patchResult = dispatch(
                  appointmentsApi.util.updateQueryData('getAppointments', 
                    apiState.queries[queryKey]?.originalArgs || {}, 
                    (draft) => {
                      if (Array.isArray(draft)) {
                        const index = draft.findIndex(apt => apt.id === id);
                        if (index !== -1) {
                          console.log('📝 Removing from array cache:', queryKey);
                          draft.splice(index, 1);
                        }
                      } else if (draft && 'items' in draft) {
                        const index = draft.items.findIndex(apt => apt.id === id);
                        if (index !== -1) {
                          console.log('📝 Removing from paginated cache:', queryKey);
                          draft.items.splice(index, 1);
                          draft.totalCount = Math.max(0, draft.totalCount - 1);
                        }
                      }
                    }
                  )
                );
                patchResults.push(patchResult);
              } catch (e) {
                console.warn('Could not update cache for query:', queryKey, e);
              }
            }
            
            // Also update employee and customer appointment queries
            if (queryKey.startsWith('getEmployeeAppointments(') || queryKey.startsWith('getCustomerAppointments(')) {
              try {
                const originalArgs = apiState.queries[queryKey]?.originalArgs;
                if (originalArgs) {
                  const patchResult = dispatch(
                    appointmentsApi.util.updateQueryData(
                      queryKey.startsWith('getEmployeeAppointments(') ? 'getEmployeeAppointments' : 'getCustomerAppointments',
                      originalArgs,
                      (draft) => {
                        const index = draft.findIndex(apt => apt.id === id);
                        if (index !== -1) {
                          console.log('📝 Removing from specific cache:', queryKey);
                          draft.splice(index, 1);
                        }
                      }
                    )
                  );
                  patchResults.push(patchResult);
                }
              } catch (e) {
                console.warn('Could not update specific cache for query:', queryKey, e);
              }
            }
          });

          // 3. Wait for the actual API call
          await queryFulfilled;
          
          console.log('✅ Delete operation successful:', id);
          
          // 4. Force immediate cache invalidation (no nuclear option needed now)
          dispatch(appointmentsApi.util.invalidateTags([
            { type: 'Appointment', id: 'LIST' },
            { type: 'Appointment', id },
            'Appointment',
            'Dashboard',
            'Employee',
            'Customer'
          ]));
          
        } catch (error) {
          console.error('❌ Delete operation failed, reverting optimistic updates:', error);
          // Revert all optimistic updates
          patchResults.forEach(patchResult => patchResult.undo());
          throw error;
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Appointment', id: 'LIST' },
        { type: 'Appointment', id },
        'Appointment',
        'Dashboard',
        'Employee',
        'Customer',
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useGetEmployeeAppointmentsQuery,
  useGetCustomerAppointmentsQuery,
  useGetAppointmentsForDateAndEmployeeQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useCancelAppointmentMutation,
  useConfirmAppointmentMutation,
  useDeleteAppointmentMutation,
  useLazyGetAppointmentsQuery,
  useLazyGetEmployeeAppointmentsQuery,
  useLazyGetCustomerAppointmentsQuery,
} = appointmentsApi;

// Export endpoints for use in other places
export const {
  getAppointments,
  getAppointmentById,
  getEmployeeAppointments,
  getCustomerAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  confirmAppointment,
  deleteAppointment,
} = appointmentsApi.endpoints;