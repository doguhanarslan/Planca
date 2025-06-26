import axios from '@/shared/api/base/axios';
import { ApiResponse, PaginatedList, AppointmentDto, CustomerDto, DashboardStats } from '@/shared/types';

/**
 * Dashboard API service to fetch dashboard-related data
 */
export class DashboardService {
  /**
   * Fetch dashboard statistics - Gerçek API verilerini kullanarak
   */
  static async getDashboardStats(tenantId: string): Promise<DashboardStats> {
    try {
      if (!tenantId) {
        console.warn('No tenantId provided for dashboard stats fetch');
        return {
          totalAppointments: 0,
          upcomingAppointments: 0,
          customersCount: 0,
          revenueThisMonth: 0,
        };
      }

      // Backend API istekleri için parametreler
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      // Paralel API istekleri ile performansı artırıyoruz
      const [totalAppointmentsResponse, upcomingAppointmentsResponse, customersResponse, completedAppointmentsResponse] = 
        await Promise.all([
          // Toplam randevu sayısı - TenantId header olarak gönderilecek
          axios.get<ApiResponse<PaginatedList<AppointmentDto>>>('/Appointments', {
            params: {
              PageNumber: 1,
              PageSize: 1
            },
            withCredentials: true
          }),
          
          // Yaklaşan randevu sayısı - TenantId header olarak gönderilecek
          axios.get<ApiResponse<PaginatedList<AppointmentDto>>>('/Appointments', {
            params: {
              PageNumber: 1,
              PageSize: 1,
              StartDate: today.toISOString()
            },
            withCredentials: true
          }),
          
          // Toplam müşteri sayısı - TenantId header olarak gönderilecek
          axios.get<ApiResponse<PaginatedList<CustomerDto>>>('/Customers', {
            params: {
              PageNumber: 1,
              PageSize: 1
            },
            withCredentials: true
          }).catch((error) => {
            console.error('Error fetching customers:', error);
            return {
              data: {
                totalCount: 0,
                items: []
              }
            }
          }),
          
          // Tamamlanmış randevular (aylık gelir hesabı için) - TenantId header olarak gönderilecek
          axios.get<ApiResponse<PaginatedList<AppointmentDto>>>('/Appointments', {
            params: {
              PageNumber: 1,
              PageSize: 100,
              StartDate: startOfMonth.toISOString(),
              EndDate: endOfMonth.toISOString(),
              Status: 'Completed'
            },
            withCredentials: true
          })
        ]);
      
      // totalCount değerlerini almanın güvenli yolu
      const getCount = (response: any): number => {
        console.log('Dashboard response for count:', response);
        
        // Backend BaseApiController.HandlePagedResult formatı
        if (response?.data?.totalCount !== undefined) {
          return response.data.totalCount;
        }
        
        // Direkt PaginatedList formatı
        if (response?.totalCount !== undefined) {
          return response.totalCount;
        }
        
        // ApiResponse wrapper içindeyse
        if (response?.data?.data?.totalCount !== undefined) {
          return response.data.data.totalCount;
        }
        
        // Array formatında geliyorsa
        if (Array.isArray(response?.data)) {
          return response.data.length;
        }
        
        console.warn('Could not extract count from response:', response);
        return 0;
      };
      
      // Aylık gelir hesaplamasını daha gerçekçi yap
      const calculateRevenue = (response: any): number => {
        // Eğer içerisinde fiyat bilgisi olan randevular varsa
        try {
          const appointments = response?.data?.data?.items || response?.data?.items || [];
          if (appointments.length > 0) {
            return appointments.reduce((total: number, appointment: any) => {
              // Randevunun hizmet fiyatı veya sabit değer kullan
              const price = appointment.price || appointment.servicePrice || 100;
              return total + price;
            }, 0);
          }
        } catch (error) {
          console.warn('Gelir hesaplaması yapılamadı:', error);
        }
        
        // Bir aylık gelir için varsayılan döndür
        return 0;
      };
      
      // Verileri toplama
      const stats: DashboardStats = {
        totalAppointments: getCount(totalAppointmentsResponse),
        upcomingAppointments: getCount(upcomingAppointmentsResponse),
        customersCount: getCount(customersResponse),
        revenueThisMonth: calculateRevenue(completedAppointmentsResponse)
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Error durumunda mümkün olduğunca verileri döndür, hiç veri alınamadıysa 0 değerlerini döndür
      return {
        totalAppointments: 0,
        upcomingAppointments: 0,
        customersCount: 0,
        revenueThisMonth: 0
      };
    }
  }

  /**
   * Fetch today's appointments - Gerçek API verilerini kullanarak
   */
  static async getTodayAppointments(tenantId: string): Promise<AppointmentDto[]> {
    try {
      if (!tenantId) {
        console.warn('No tenantId provided for today\'s appointments fetch');
        return [];
      }
      
      // Bugünün başlangıç ve bitiş zamanları
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()); 
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      // API isteği ile bugünün randevularını getir - TenantId header olarak gönderilecek
      const response = await axios.get<ApiResponse<PaginatedList<AppointmentDto>>>('/Appointments', {
        params: {
          PageNumber: 1,
          PageSize: 10,
          StartDate: startOfDay.toISOString(),
          EndDate: endOfDay.toISOString(),
          SortBy: 'StartTime',
          SortAscending: true
        },
        withCredentials: true
      });
      
      // API yanıt tipine göre hangi verileri alacağımızı belirle
      let appointments: AppointmentDto[] = [];
      
      console.log('Today appointments raw response:', response);
      
      // ApiResponse<PaginatedList<T>> formatı - response.data.data.items
      if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        appointments = response.data.data.items;
      } 
      // Backend direkt PaginatedList döndürüyorsa - response.data.items  
      else if ((response.data as any)?.items && Array.isArray((response.data as any).items)) {
        appointments = (response.data as any).items;
      } 
      // Direkt array formatında geliyorsa
      else if (Array.isArray(response.data)) {
        appointments = response.data as any;
      }
      else {
        console.warn('Unexpected today appointments response format:', response);
        appointments = [];
      }
      
      // Uygun şekilde veri dönüşümü yaparak istenen formatta döndür
      return appointments.map(appointment => ({
        ...appointment,
        // Tarihleri doğru formatta olduğundan emin ol
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        // Eksik/boş isim alanları varsa isimsiz olarak göster
        customerName: appointment.customerName || 'İsimsiz Müşteri',
        employeeName: appointment.employeeName || 'Atanmamış',
        serviceName: appointment.serviceName || 'Belirtilmemiş'
      }));
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
      // Hata durumunda boş dizi döndür
      return [];
    }
  }
} 