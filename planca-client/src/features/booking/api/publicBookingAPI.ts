// features/booking/api/publicBookingAPI.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  BusinessInfo,
  PublicServiceDto,
  PublicEmployeeDto,
  TimeSlot,
  CreateGuestAppointmentRequest,
  AppointmentRequestResponse,
  AppointmentStatus,
  TimeSlotQuery,
  BusinessEmployeesQuery,
  AppointmentStatusQuery
} from '../model/types';

// Base query configuration
const baseQuery = fetchBaseQuery({
  baseUrl: '/api/public/booking',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    return headers;
  },
});

// Enhanced base query with error handling
const baseQueryWithErrorHandling = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // Handle API errors
  if (result.error) {
    console.error('Public Booking API Error:', result.error);
  }
  
  return result;
};

export const publicBookingAPI = createApi({
  reducerPath: 'publicBookingAPI',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ['BusinessInfo', 'Services', 'Employees', 'TimeSlots', 'AppointmentStatus'],
  endpoints: (builder) => ({
    
    // Get business information
    getBusinessInfo: builder.query<BusinessInfo, string>({
      query: (tenantSlug) => ({
        url: `business/${tenantSlug}/info`,
        method: 'GET',
      }),
      providesTags: (result, error, tenantSlug) => [
        { type: 'BusinessInfo', id: tenantSlug }
      ],
      transformResponse: (response: any): BusinessInfo => {
        // Backend response transformation if needed
        return {
          id: response.id,
          businessName: response.businessName,
          description: response.description || '',
          address: response.address || '',
          phoneNumber: response.phoneNumber || '',
          email: response.email || '',
          website: response.website || '',
          workingHours: response.workingHours || '09:00-17:00'
        };
      },
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.message || 'İşletme bilgileri alınamadı',
        };
      },
    }),

    // Get business services
    getBusinessServices: builder.query<PublicServiceDto[], string>({
      query: (tenantSlug) => ({
        url: `business/${tenantSlug}/services`,
        method: 'GET',
      }),
      providesTags: (result, error, tenantSlug) => [
        { type: 'Services', id: tenantSlug },
        ...(result || []).map((service) => ({ type: 'Services' as const, id: service.id }))
      ],
      transformResponse: (response: any): PublicServiceDto[] => {
        // Ensure response is array and transform if needed
        const services = Array.isArray(response) ? response : [];
        return services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          price: service.price || 0,
          duration: service.duration || service.durationMinutes || 30,
          isActive: service.isActive !== false, // Default to true
        }));
      },
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.message || 'Hizmetler alınamadı',
        };
      },
    }),

    // Get business employees (optionally filtered by service)
    getBusinessEmployees: builder.query<PublicEmployeeDto[], BusinessEmployeesQuery>({
      query: ({ tenantSlug, serviceId }) => ({
        url: `business/${tenantSlug}/employees`,
        method: 'GET',
        params: serviceId ? { serviceId } : {},
      }),
      providesTags: (result, error, { tenantSlug, serviceId }) => [
        { type: 'Employees', id: `${tenantSlug}-${serviceId || 'all'}` },
        ...(result || []).map((employee) => ({ type: 'Employees' as const, id: employee.id }))
      ],
      transformResponse: (response: any): PublicEmployeeDto[] => {
        const employees = Array.isArray(response) ? response : [];
        return employees.map(employee => ({
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          title: employee.title || '',
          isActive: employee.isActive !== false,
        }));
      },
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.message || 'Personeller alınamadı',
        };
      },
    }),

    // Get available time slots
    getAvailableTimeSlots: builder.query<TimeSlot[], TimeSlotQuery>({
      query: ({ tenantSlug, employeeId, serviceId, date }) => ({
        url: `business/${tenantSlug}/availability`,
        method: 'GET',
        params: {
          employeeId,
          serviceId,
          date, // YYYY-MM-DD format
        },
      }),
      providesTags: (result, error, { tenantSlug, employeeId, date }) => [
        { type: 'TimeSlots', id: `${tenantSlug}-${employeeId}-${date}` }
      ],
      transformResponse: (response: any): TimeSlot[] => {
        const slots = Array.isArray(response) ? response : [];
        return slots.map(slot => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable !== false,
          formattedTime: slot.formattedTime || formatTimeFromISO(slot.startTime),
        }));
      },
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.message || 'Müsait saatler alınamadı',
        };
      },
      // Cache for 5 minutes since availability changes frequently
      keepUnusedDataFor: 300,
    }),

    // Create guest appointment
    createGuestAppointment: builder.mutation<AppointmentRequestResponse, {
      tenantSlug: string;
      appointmentData: CreateGuestAppointmentRequest;
    }>({
      query: ({ tenantSlug, appointmentData }) => ({
        url: `business/${tenantSlug}/appointment`,
        method: 'POST',
        body: appointmentData,
      }),
      // Invalidate time slots after creating appointment
      invalidatesTags: (result, error, { tenantSlug, appointmentData }) => [
        { type: 'TimeSlots', id: `${tenantSlug}-${appointmentData.employeeId}` },
      ],
      transformResponse: (response: any): AppointmentRequestResponse => {
        return {
          success: response.success !== false,
          message: response.message || 'Randevu talebi alındı',
          appointmentId: response.appointmentId,
          confirmationCode: response.confirmationCode,
        };
      },
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.message || 'Randevu oluşturulamadı',
          errors: response.data?.errors || [],
        };
      },
    }),

    // Get appointment status (optional feature)
    getAppointmentStatus: builder.query<AppointmentStatus, AppointmentStatusQuery>({
      query: ({ confirmationCode, email }) => ({
        url: `appointment/${confirmationCode}/status`,
        method: 'GET',
        params: { email },
      }),
      providesTags: (result, error, { confirmationCode }) => [
        { type: 'AppointmentStatus', id: confirmationCode }
      ],
      transformResponse: (response: any): AppointmentStatus => {
        return {
          id: response.id,
          status: response.status || 'Pending',
          customerName: response.customerName || '',
          serviceName: response.serviceName || '',
          employeeName: response.employeeName || '',
          startTime: response.startTime,
          endTime: response.endTime,
          notes: response.notes,
          customerMessage: response.customerMessage,
        };
      },
      transformErrorResponse: (response: any) => {
        return {
          status: response.status,
          message: response.data?.message || 'Randevu durumu alınamadı',
        };
      },
    }),
  }),
});

// Helper function to format time from ISO string
const formatTimeFromISO = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch (error) {
    return '00:00';
  }
};

// Export hooks for components
export const {
  useGetBusinessInfoQuery,
  useGetBusinessServicesQuery,
  useGetBusinessEmployeesQuery,
  useGetAvailableTimeSlotsQuery,
  useCreateGuestAppointmentMutation,
  useGetAppointmentStatusQuery,
  
  // Manual query triggers
  useLazyGetBusinessInfoQuery,
  useLazyGetBusinessServicesQuery,
  useLazyGetBusinessEmployeesQuery,
  useLazyGetAvailableTimeSlotsQuery,
  useLazyGetAppointmentStatusQuery,
} = publicBookingAPI;

// Export API slice for store configuration
export default publicBookingAPI;