import axios from '@/utils/axios';
import { EmployeeDto, PaginatedList } from '@/types';

class EmployeesAPI {
  private static readonly ENDPOINT = '/Employees';
  private static employeeCache = new Map<string, EmployeeDto>();

  /**
   * Get employees with pagination and filtering
   */
  static async getEmployees(params: {
    pageNumber?: number;
    pageSize?: number;
    searchString?: string;
    isActive?: boolean;
    serviceId?: string;
    sortBy?: string;
    sortAscending?: boolean;
    tenantId?: string;
    skipCache?: boolean;
  }) {
    try {
      // Prepare query parameters
      const queryParams: Record<string, any> = {
        PageNumber: params.pageNumber,
        PageSize: params.pageSize,
        SearchString: params.searchString,
        IsActive: params.isActive,
        ServiceId: params.serviceId,
        SortBy: params.sortBy,
        SortAscending: params.sortAscending
      };
      
      // Headers for tenant ID
      const headers: Record<string, string> = {};
      if (params.tenantId) {
        headers['X-TenantId'] = params.tenantId;
      }
      
      // Make the request
      const response = await axios.get<PaginatedList<EmployeeDto>>(
        `${EmployeesAPI.ENDPOINT}`,
        { 
          params: queryParams,
          headers,
          withCredentials: true 
        }
      );
      
      // Cache the employees for future use
      response.data.items.forEach(employee => {
        EmployeesAPI.employeeCache.set(employee.id, employee);
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Return empty result in case of error
      return { 
        succeeded: true, 
        data: { 
          items: [], 
          pageNumber: 1, 
          totalPages: 0, 
          totalCount: 0, 
          hasNextPage: false, 
          hasPreviousPage: false 
        } 
      };
    }
  }

  /**
   * Get a specific employee by ID
   */
  static async getEmployeeById(id: string, skipCache = false) {
    try {
      // Check cache first unless skip is requested
      if (!skipCache && EmployeesAPI.employeeCache.has(id)) {
        return EmployeesAPI.employeeCache.get(id);
      }

      const response = await axios.get<EmployeeDto>(
        `${EmployeesAPI.ENDPOINT}/${id}`,
        { withCredentials: true }
      );
      
      // Cache the result
      EmployeesAPI.employeeCache.set(id, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get employees for a specific service
   */
  static async getEmployeesByService(serviceId: string, tenantId?: string) {
    try {
      // Headers for tenant ID
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['X-TenantId'] = tenantId;
      }
      
      const response = await axios.get<EmployeeDto[]>(
        `${EmployeesAPI.ENDPOINT}/service/${serviceId}`,
        { 
          withCredentials: true,
          headers
        }
      );
      
      // Cache the employees
      response.data.forEach(employee => {
        EmployeesAPI.employeeCache.set(employee.id, employee);
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching employees for service ${serviceId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new employee
   */
  static async createEmployee(employeeData: Omit<EmployeeDto, 'id' | 'fullName'>) {
    try {
      // Transform data to match backend expectations
      const transformedData = {
        FirstName: employeeData.firstName,
        LastName: employeeData.lastName,
        Email: employeeData.email,
        PhoneNumber: employeeData.phoneNumber || '',
        Title: employeeData.title || '',
        IsActive: employeeData.isActive,
        UserId: employeeData.userId || '',
        ServiceIds: employeeData.serviceIds,
        WorkingHours: employeeData.workingHours.map(wh => ({
          DayOfWeek: wh.dayOfWeek,
          StartTime: wh.startTime,
          EndTime: wh.endTime,
          IsWorkingDay: wh.isWorkingDay
        }))
      };
      
      const response = await axios.post<EmployeeDto>(
        EmployeesAPI.ENDPOINT,
        transformedData,
        { withCredentials: true }
      );
      
      // Clear cache when creating a new employee
      EmployeesAPI.employeeCache.clear();
      
      return response.data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Update an existing employee
   */
  static async updateEmployee(id: string, employeeData: Omit<EmployeeDto, 'fullName'>) {
    try {
      // Transform data to match backend expectations
      const transformedData = {
        Id: id,
        FirstName: employeeData.firstName,
        LastName: employeeData.lastName,
        Email: employeeData.email,
        PhoneNumber: employeeData.phoneNumber || '',
        Title: employeeData.title || '',
        IsActive: employeeData.isActive,
        UserId: employeeData.userId,
        ServiceIds: employeeData.serviceIds,
        WorkingHours: employeeData.workingHours.map(wh => ({
          DayOfWeek: wh.dayOfWeek,
          StartTime: wh.startTime,
          EndTime: wh.endTime,
          IsWorkingDay: wh.isWorkingDay
        }))
      };
      
      const response = await axios.put<EmployeeDto>(
        `${EmployeesAPI.ENDPOINT}/${id}`,
        transformedData,
        { withCredentials: true }
      );
      
      // Update cache
      EmployeesAPI.employeeCache.set(id, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Error updating employee with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an employee
   */
  static async deleteEmployee(id: string) {
    try {
      await axios.delete(
        `${EmployeesAPI.ENDPOINT}/${id}`,
        { withCredentials: true }
      );
      
      // Remove from cache
      EmployeesAPI.employeeCache.delete(id);
      
      return true;
    } catch (error) {
      console.error(`Error deleting employee with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Clear employee cache
   */
  static clearCache() {
    EmployeesAPI.employeeCache.clear();
  }
}

export default EmployeesAPI; 