// src/features/dashboard/api/dashboardAPI.ts
import { baseApi } from '@/shared/api/base/baseApi';
import { DashboardStats, AppointmentDto } from '@/shared/types';

// Dashboard API - mevcut endpoint'leri kullanarak dashboard verilerini toplar
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Birleşik dashboard stats - mevcut API'leri kullanarak hesaplar
    getDashboardStats: builder.query<DashboardStats, { tenantId: string }>({
      async queryFn({ tenantId }, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          if (!tenantId) {
            throw new Error('TenantId is required for dashboard stats');
          }

          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

          // Paralel API çağrıları
          const [
            totalAppointmentsResult,
            upcomingAppointmentsResult,
            customersResult,
            completedAppointmentsResult
          ] = await Promise.allSettled([
            // Toplam randevu sayısı
            fetchWithBQ({
              url: '/Appointments',
              params: {
                PageNumber: 1,
                PageSize: 1,
                TenantId: tenantId,
                _t: Date.now()
              }
            }),
            
            // Yaklaşan randevular (bugünden itibaren)
            fetchWithBQ({
              url: '/Appointments',
              params: {
                PageNumber: 1,
                PageSize: 1,
                StartDate: startOfDay.toISOString(),
                TenantId: tenantId,
                _t: Date.now()
              }
            }),
            
            // Toplam müşteri sayısı
            fetchWithBQ({
              url: '/Customers',
              params: {
                PageNumber: 1,
                PageSize: 1,
                TenantId: tenantId,
                _t: Date.now()
              }
            }),
            
            // Bu ayki tamamlanmış randevular (gelir hesabı için)
            fetchWithBQ({
              url: '/Appointments',
              params: {
                PageNumber: 1,
                PageSize: 100,
                StartDate: startOfMonth.toISOString(),
                EndDate: endOfMonth.toISOString(),
                Status: 'Completed',
                TenantId: tenantId,
                _t: Date.now()
              }
            })
          ]);

          // Sonuçları işle ve hataları handle et
          const getCount = (result: PromiseSettledResult<any>): number => {
            if (result.status === 'fulfilled' && result.value?.data) {
              const response = result.value.data;
              // Farklı response formatlarını handle et
              if (response?.data?.totalCount !== undefined) {
                return response.data.totalCount;
              } else if (response?.totalCount !== undefined) {
                return response.totalCount;
              } else if (Array.isArray(response?.data)) {
                return response.data.length;
              } else if (Array.isArray(response)) {
                return response.length;
              }
            }
            return 0;
          };

          const calculateRevenue = (result: PromiseSettledResult<any>): number => {
            if (result.status === 'fulfilled' && result.value?.data) {
              try {
                const response = result.value.data;
                const appointments = response?.data?.items || response?.items || [];
                if (Array.isArray(appointments) && appointments.length > 0) {
                  return appointments.reduce((total: number, appointment: any) => {
                    const price = appointment.price || appointment.servicePrice || 150; // Varsayılan fiyat
                    return total + price;
                  }, 0);
                }
              } catch (error) {
                console.warn('Gelir hesaplaması yapılamadı:', error);
              }
            }
            return 0;
          };

          const stats: DashboardStats = {
            totalAppointments: getCount(totalAppointmentsResult),
            upcomingAppointments: getCount(upcomingAppointmentsResult),
            customersCount: getCount(customersResult),
            revenueThisMonth: calculateRevenue(completedAppointmentsResult)
          };

          return { data: stats };
        } catch (error) {
          console.error('Dashboard stats fetch error:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Dashboard verilerini yüklerken hata oluştu'
            }
          };
        }
      },
      providesTags: (result, error, { tenantId }) => [
        { type: 'Dashboard', id: `stats-${tenantId}` },
        'Appointment', // Cache invalidation için
        'Customer',    // Cache invalidation için
      ],
    }),

    // Bugünkü randevular - mevcut Appointments API'sini kullanır
    getTodayAppointments: builder.query<AppointmentDto[], { tenantId: string; limit?: number }>({
      query: ({ tenantId, limit = 10 }) => {
        if (!tenantId) {
          throw new Error('TenantId is required for today\'s appointments');
        }

        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        return {
          url: '/Appointments',
          params: {
            PageNumber: 1,
            PageSize: limit,
            StartDate: startOfDay.toISOString(),
            EndDate: endOfDay.toISOString(),
            SortBy: 'StartTime',
            SortAscending: true,
            TenantId: tenantId,
            _t: Date.now()
          }
        };
      },
      transformResponse: (response: any): AppointmentDto[] => {
        // Handle different response formats
        if (response?.data?.items && Array.isArray(response.data.items)) {
          return response.data.items.map((appointment: AppointmentDto) => ({
            ...appointment,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            customerName: appointment.customerName || 'İsimsiz Müşteri',
            employeeName: appointment.employeeName || 'Atanmamış',
            serviceName: appointment.serviceName || 'Belirtilmemiş'
          }));
        } else if (response?.items && Array.isArray(response.items)) {
          return response.items.map((appointment: AppointmentDto) => ({
            ...appointment,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            customerName: appointment.customerName || 'İsimsiz Müşteri',
            employeeName: appointment.employeeName || 'Atanmamış',
            serviceName: appointment.serviceName || 'Belirtilmemiş'
          }));
        } else if (Array.isArray(response)) {
          return response.map((appointment: AppointmentDto) => ({
            ...appointment,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            customerName: appointment.customerName || 'İsimsiz Müşteri',
            employeeName: appointment.employeeName || 'Atanmamış',
            serviceName: appointment.serviceName || 'Belirtilmemiş'
          }));
        }
        
        return [];
      },
      providesTags: (result, error, { tenantId }) => [
        { type: 'Dashboard', id: `today-appointments-${tenantId}` },
        'Appointment', // Cache invalidation için
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetDashboardStatsQuery,
  useGetTodayAppointmentsQuery,
  useLazyGetDashboardStatsQuery,
  useLazyGetTodayAppointmentsQuery,
} = dashboardApi;

// Export endpoints for advanced usage
export const {
  getDashboardStats,
  getTodayAppointments,
} = dashboardApi.endpoints;