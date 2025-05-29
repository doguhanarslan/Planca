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
    _t: Date.now(), // Cache busting
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
    // Get paginated appointments list
    getAppointments: builder.query<
      PaginatedList<AppointmentDto> | AppointmentDto[], 
      {
        startDate?: string;
        endDate?: string;
        employeeId?: string;
        customerId?: string;
        status?: string;
        pageNumber?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: 'asc' | 'desc';
      }
    >({
      query: (params = {}) => ({
        url: '/Appointments',
        params: transformParams(params),
      }),
      transformResponse: (response: any) => {
        console.log('RTK Query Appointments Response:', response);
        
        // Handle different response formats
        if (response?.data?.items) {
          // ApiResponse<PaginatedList> format
          return response.data;
        } else if (response?.items) {
          // Direct PaginatedList format
          return response;
        } else if (Array.isArray(response?.data)) {
          // Direct array format
          return response.data;
        } else if (Array.isArray(response)) {
          // Direct array format
          return response;
        } else {
          // Fallback
          return {
            items: [],
            pageNumber: 1,
            totalPages: 0,
            totalCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          };
        }
      },
      providesTags: (result, error, arg) => [
        'Appointment',
        // Add individual tags for each appointment for more granular invalidation
        ...(Array.isArray(result) 
          ? result.map(({ id }) => ({ type: 'Appointment' as const, id }))
          : 'items' in result 
            ? result.items?.map(({ id }) => ({ type: 'Appointment' as const, id })) || []
            : []
        ),
      ],
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
      invalidatesTags: [
        'Appointment', // Invalidate all appointments to refresh lists
      ],
    }),

    // Update existing appointment
    updateAppointment: builder.mutation<AppointmentDto, AppointmentDto>({
      query: (appointmentData) => ({
        url: `/Appointments/${appointmentData.id}`,
        method: 'PUT',
        body: transformAppointmentForApi(appointmentData),
      }),
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
        'Appointment', // Invalidate all appointments
        { type: 'Appointment', id }, // Invalidate specific appointment
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
        'Appointment',
        { type: 'Appointment', id },
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
        'Appointment',
        { type: 'Appointment', id },
      ],
    }),

    // Delete appointment
    deleteAppointment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/Appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        'Appointment', // Invalidate all appointments
        { type: 'Appointment', id }, // Invalidate specific appointment
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