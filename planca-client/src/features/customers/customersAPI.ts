import axios from '@/utils/axios';
import { ApiResponse, PaginatedList, CustomerDto, AppointmentDto } from '@/types';

/**
 * Customers API endpoints and methods
 */
class CustomersAPI {
  private static readonly ENDPOINT = '/Customers';

  /**
   * Get a paginated list of customers with optional filtering
   */
  static async getCustomers(params: {
    pageNumber?: number;
    pageSize?: number;
    searchString?: string;
    sortBy?: string;
    sortAscending?: boolean;
    tenantId?: string;
  }) {
    try {
      // Convert params to match API's expected PascalCase naming
      const apiParams: Record<string, any> = {
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 10,
        SortBy: params.sortBy || 'LastName',
        SortAscending: params.sortAscending !== false,
        _t: new Date().getTime() // Timestamp to prevent caching
      };
      
      // Only add search parameter if it has an actual value
      if (params.searchString && params.searchString.trim() !== '') {
        apiParams['SearchString'] = params.searchString;
      }
      
      // Set up headers
      const headers: Record<string, string> = {};
      if (params.tenantId) {
        headers['X-TenantId'] = params.tenantId;
      }
      
      const response = await axios.get<ApiResponse<PaginatedList<CustomerDto>>>(
        CustomersAPI.ENDPOINT,
        { 
          params: apiParams, 
          withCredentials: true,
          headers
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  /**
   * Get a single customer by ID
   */
  static async getCustomerById(id: string, tenantId?: string) {
    try {
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['X-TenantId'] = tenantId;
      }
      
      const response = await axios.get<ApiResponse<CustomerDto>>(
        `${CustomersAPI.ENDPOINT}/${id}`,
        { 
          withCredentials: true,
          headers 
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new customer
   */
  static async createCustomer(customerData: Omit<CustomerDto, 'id'>) {
    try {
      // Create a clean object with ONLY PascalCase properties
      const transformedData = {
        FirstName: customerData.firstName,
        LastName: customerData.lastName,
        Email: customerData.email,
        PhoneNumber: customerData.phoneNumber,
        Notes: customerData.notes,
        TenantId: customerData.tenantId,
        Address: customerData.address ? {
          Street: customerData.address.street,
          City: customerData.address.city,
          State: customerData.address.state,
          ZipCode: customerData.address.zipCode,
          Country: customerData.address.country
        } : null
      };
      
      const response = await axios.post<ApiResponse<CustomerDto>>(
        CustomersAPI.ENDPOINT,
        transformedData,
        { withCredentials: true }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Update an existing customer
   */
  static async updateCustomer(id: string, customerData: CustomerDto) {
    try {
      // Create a clean object with ONLY PascalCase properties
      const transformedData = {
        Id: id,
        FirstName: customerData.firstName,
        LastName: customerData.lastName,
        Email: customerData.email,
        PhoneNumber: customerData.phoneNumber,
        Notes: customerData.notes,
        Address: customerData.address ? {
          Street: customerData.address.street,
          City: customerData.address.city,
          State: customerData.address.state,
          ZipCode: customerData.address.zipCode,
          Country: customerData.address.country
        } : null
      };
      
      const response = await axios.put<ApiResponse<CustomerDto>>(
        `${CustomersAPI.ENDPOINT}/${id}`,
        transformedData,
        { withCredentials: true }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a customer
   */
  static async deleteCustomer(id: string) {
    try {
      const response = await axios.delete<ApiResponse<void>>(
        `${CustomersAPI.ENDPOINT}/${id}`,
        { withCredentials: true }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get appointments for a specific customer
   */
  static async getCustomerAppointments(customerId: string, params: {
    startDate?: string;
    endDate?: string;
    status?: string;
    futureOnly?: boolean;
    pastOnly?: boolean;
    sortAscending?: boolean;
    tenantId?: string;
  } = {}) {
    try {
      // Convert params to match API's expected PascalCase naming
      const apiParams: Record<string, any> = {
        CustomerId: customerId,
        SortAscending: params.sortAscending !== false,
        _t: new Date().getTime() // Timestamp to prevent caching
      };
      
      // Add optional parameters
      if (params.startDate) apiParams['StartDate'] = params.startDate;
      if (params.endDate) apiParams['EndDate'] = params.endDate;
      if (params.status) apiParams['Status'] = params.status;
      if (params.futureOnly) apiParams['FutureOnly'] = params.futureOnly;
      if (params.pastOnly) apiParams['PastOnly'] = params.pastOnly;
      
      // Set up headers
      const headers: Record<string, string> = {};
      if (params.tenantId) {
        headers['X-TenantId'] = params.tenantId;
      }
      
      const response = await axios.get<ApiResponse<AppointmentDto[]>>(
        `/Appointments/customer/${customerId}`,
        { 
          params: apiParams, 
          withCredentials: true,
          headers
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for customer ${customerId}:`, error);
      throw error;
    }
  }
}

export default CustomersAPI; 