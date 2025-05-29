import axios from '@/shared/api/base/axios';
import { AppointmentDto } from '../../shared/types';

class AppointmentsAPI {
  private static readonly ENDPOINT = '/Appointments';
  private static appointmentsCache = new Map<string, { data: AppointmentDto[], timestamp: number }>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get all appointments with optional filtering
   */
  static async getAppointments(params: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    customerId?: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    tenantId?: string;
  } = {}) {
    try {
      // Log request parameters
      console.log('AppointmentsAPI.getAppointments - Request params:', params);
      
      // Headers for tenant ID
      const headers: Record<string, string> = {};
      if (params.tenantId) {
        headers['X-TenantId'] = params.tenantId;
      }
      
      console.log('AppointmentsAPI.getAppointments - Request headers:', headers);
      
      const response = await axios.get(AppointmentsAPI.ENDPOINT, {
        params,
        headers,
        withCredentials: true
      }).then((response) => {
        console.log('AppointmentsAPI.getAppointments - Raw response:', response);
        return response;
      }).catch((error) => {
        console.error('Error fetching appointments:', error);
        throw error;
      });
      
      // Log the raw response structure to understand the data format
      console.log('AppointmentsAPI.getAppointments - Raw response:', response);
      
      // Add data structure analysis
      if (response.data) {
        console.log('AppointmentsAPI.getAppointments - Response data type:', typeof response.data);
        console.log('AppointmentsAPI.getAppointments - Is array?', Array.isArray(response.data));
        
        if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          console.log('AppointmentsAPI.getAppointments - Object keys:', Object.keys(response.data));
          
          // API returns a paginated list structure with 'items' array
          if (response.data.items && Array.isArray(response.data.items)) {
            console.log('AppointmentsAPI.getAppointments - Found items array with length:', response.data.items.length);
            
            if (response.data.items.length > 0) {
              console.log('AppointmentsAPI.getAppointments - Sample item:', response.data.items[0]);
            }
            
            // Return the entire response structure
            return response.data;
          }
        } else if (Array.isArray(response.data)) {
          console.log('AppointmentsAPI.getAppointments - Array length:', response.data.length);
          if (response.data.length > 0) {
            console.log('AppointmentsAPI.getAppointments - Sample item:', response.data[0]);
          }
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointment(id: string) {
    try {
      const response = await axios.get(`${AppointmentsAPI.ENDPOINT}/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get appointments for a specific employee
   */
  static async getEmployeeAppointments(employeeId: string, startDate: string, endDate: string, tenantId?: string) {
    try {
      const cacheKey = `employee_${employeeId}_${startDate}_${endDate}`;
      const cachedData = this.getCachedAppointments(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      // Headers for tenant ID
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['X-TenantId'] = tenantId;
      }
      
      const response = await axios.get<AppointmentDto[]>(
        `${AppointmentsAPI.ENDPOINT}/employee/${employeeId}`, {
          params: { startDate, endDate },
          headers,
          withCredentials: true
        }
      );
      
      this.cacheAppointments(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Get appointments for a specific customer
   */
  static async getCustomerAppointments(customerId: string, startDate?: string, endDate?: string, tenantId?: string) {
    try {
      // Generate cache key if dates provided
      const dateParams = startDate && endDate ? `_${startDate}_${endDate}` : '';
      const cacheKey = `customer_${customerId}${dateParams}`;
      const cachedData = this.getCachedAppointments(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }
      
      // Headers for tenant ID
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['X-TenantId'] = tenantId;
      }
      
      // Prepare params
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      console.log(`Fetching appointments for customer ${customerId}:`, { params, headers });
      
      const response = await axios.get<AppointmentDto[]>(
        `${AppointmentsAPI.ENDPOINT}/customer/${customerId}`, {
          params,
          headers,
          withCredentials: true
        }
      );
      
      console.log(`Received ${response.data.length} appointments for customer:`, response.data);
      
      // Cache the result
      this.cacheAppointments(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for customer ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new appointment
   */
  static async createAppointment(appointmentData: {
    customerId: string;
    employeeId: string;
    serviceId: string;
    startTime: string;
    notes?: string;
    tenantId?: string;
  }) {
    try {
      // Extract tenantId from the data (if provided)
      const { tenantId, ...data } = appointmentData;
      
      // Headers for tenant ID
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['X-TenantId'] = tenantId;
      }
      
      const response = await axios.post(
        AppointmentsAPI.ENDPOINT,
        data,
        { 
          withCredentials: true,
          headers 
        }
      );
      
      // Clear cache when creating a new appointment
      this.clearCache();
      
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Update an existing appointment
   */
  static async updateAppointment(id: string, appointmentData: Partial<{
    customerId: string;
    employeeId: string;
    serviceId: string;
    startTime: string;
    notes?: string;
    tenantId?: string;
  }>) {
    try {
      // Extract tenantId from the data (if provided)
      const { tenantId, ...data } = appointmentData;
      
      // Headers for tenant ID
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['X-TenantId'] = tenantId;
      }
      
      const response = await axios.put(
        `${AppointmentsAPI.ENDPOINT}/${id}`,
        { id, ...data },
        { 
          withCredentials: true,
          headers 
        }
      );
      
      // Clear cache when updating an appointment
      this.clearCache();
      
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Cancel an appointment
   */
  static async cancelAppointment(id: string, reason?: string) {
    try {
      const response = await axios.post(
        `${AppointmentsAPI.ENDPOINT}/${id}/cancel`,
        { id, reason },
        { withCredentials: true }
      );
      
      // Clear cache when canceling an appointment
      this.clearCache();
      
      return response.data;
    } catch (error) {
      console.error(`Error canceling appointment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Confirm an appointment
   */
  static async confirmAppointment(id: string) {
    try {
      const response = await axios.post(
        `${AppointmentsAPI.ENDPOINT}/${id}/confirm`,
        {},
        { withCredentials: true }
      );
      
      // Clear cache when confirming an appointment
      this.clearCache();
      
      return response.data;
    } catch (error) {
      console.error(`Error confirming appointment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an appointment
   */
  static async deleteAppointment(id: string) {
    try {
      const response = await axios.delete(
        `${AppointmentsAPI.ENDPOINT}/${id}`,
        { withCredentials: true }
      );
      
      // Clear cache when deleting an appointment
      this.clearCache();
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting appointment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get cached appointments
   */
  private static getCachedAppointments(cacheKey: string): AppointmentDto[] | null {
    const cacheEntry = this.appointmentsCache.get(cacheKey);
    
    if (!cacheEntry) {
      return null;
    }
    
    const now = Date.now();
    if (now - cacheEntry.timestamp > this.CACHE_DURATION) {
      // Cache expired
      this.appointmentsCache.delete(cacheKey);
      return null;
    }
    
    return cacheEntry.data;
  }
  
  /**
   * Cache appointments
   */
  private static cacheAppointments(cacheKey: string, data: AppointmentDto[]): void {
    this.appointmentsCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Clear all cached appointments
   */
  private static clearCache(): void {
    this.appointmentsCache.clear();
  }

  /**
   * Get appointments for a given date and employee to check availability
   */
  static async getAppointmentsForDateAndEmployee(employeeId: string, date: Date, tenantId?: string) {
    try {
      if (!employeeId) {
        return [];
      }
      
      // Create start and end of the requested day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      // Use the existing employee appointments endpoint with the day's date range
      return await this.getEmployeeAppointments(
        employeeId,
        startDate.toISOString(),
        endDate.toISOString(),
        tenantId
      );
    } catch (error) {
      console.error(`Error fetching appointments for date and employee:`, error);
      throw error;
    }
  }
}

export default AppointmentsAPI; 