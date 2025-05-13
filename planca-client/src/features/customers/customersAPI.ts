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
      
      const response = await axios.get<PaginatedList<CustomerDto>>(
        CustomersAPI.ENDPOINT,
        { 
          params: apiParams, 
          withCredentials: true,
          headers
        }
      );
      
      console.log('API Response from getCustomers:', response.data);
      console.log('API Response Structure:', {
        hasItems: !!response.data.items,
        isItemsArray: response.data.items && Array.isArray(response.data.items),
        itemsLength: response.data.items ? response.data.items.length : 0,
        pageInfo: {
          pageNumber: response.data.pageNumber,
          totalPages: response.data.totalPages,
          totalCount: response.data.totalCount
        }
      });
      
      // The API response is already the PaginatedList, no need to check for succeeded
      // Just verify we have a valid response with items property
      if (!response.data || !response.data.items) {
        console.warn('API response missing items array');
        // Return empty result with valid structure
        return {
          items: [],
          pageNumber: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false
        };
      }
      
      // Transform data here if needed
      if (response.data.items) {
        // Handle possible PascalCase property names from the backend
        response.data.items = response.data.items.map(customer => {
          if (!customer) return null;
          
          // Use type assertion to handle different casing
          const customerAny = customer as any;
          
          return {
            id: customer.id || customerAny.Id || '',
            userId: customer.userId || customerAny.UserId || null,
            firstName: customer.firstName || customerAny.FirstName || '',
            lastName: customer.lastName || customerAny.LastName || '',
            fullName: customer.fullName || customerAny.FullName || 
                     `${customer.firstName || customerAny.FirstName || ''} ${customer.lastName || customerAny.LastName || ''}`,
            email: customer.email || customerAny.Email || '',
            phoneNumber: customer.phoneNumber || customerAny.PhoneNumber || '',
            notes: customer.notes || customerAny.Notes || '',
            tenantId: customer.tenantId || customerAny.TenantId || null
          };
        }).filter(Boolean) as CustomerDto[];
      }
      
      // Add additional logging to see what we're returning
      const result = response.data;
      
      console.log('Final API result to be returned to Redux:', result);
      
      // Return the data directly since it's already in the correct format
      return result;
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
      
      const response = await axios.get<CustomerDto>(
        `${CustomersAPI.ENDPOINT}/${id}`,
        { 
          withCredentials: true,
          headers 
        }
      );
      
      console.log('API Response from getCustomerById:', response.data);
      
      // Transform data if needed
      if (response.data) {
        // Use type assertion to handle different casing
        const customerAny = response.data as any;
        
        // Handle possible PascalCase property names from the backend
        const normalizedCustomer = {
          id: response.data.id || customerAny.Id || '',
          userId: response.data.userId || customerAny.UserId || null,
          firstName: response.data.firstName || customerAny.FirstName || '',
          lastName: response.data.lastName || customerAny.LastName || '',
          fullName: response.data.fullName || customerAny.FullName || 
                   `${response.data.firstName || customerAny.FirstName || ''} ${response.data.lastName || customerAny.LastName || ''}`,
          email: response.data.email || customerAny.Email || '',
          phoneNumber: response.data.phoneNumber || customerAny.PhoneNumber || '',
          notes: response.data.notes || customerAny.Notes || '',
          tenantId: response.data.tenantId || customerAny.TenantId || null
        };
        
        return normalizedCustomer;
      }
      
      // Return null if we don't have valid customer data
      return null;
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
        UserId: customerData.userId,
        TenantId: customerData.tenantId
      };
      
      const response = await axios.post<CustomerDto>(
        CustomersAPI.ENDPOINT,
        transformedData,
        { withCredentials: true }
      );
      
      // The response is already the customer data
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
        UserId: customerData.userId
      };
      
      const response = await axios.put<CustomerDto>(
        `${CustomersAPI.ENDPOINT}/${id}`,
        transformedData,
        { withCredentials: true }
      );
      
      // The response is already the updated customer
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
      const response = await axios.delete(
        `${CustomersAPI.ENDPOINT}/${id}`,
        { withCredentials: true }
      );
      
      // Just return success status
      return response.status === 200 || response.status === 204;
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
      
      const response = await axios.get<AppointmentDto[]>(
        `/Appointments/customer/${customerId}`,
        { 
          params: apiParams, 
          withCredentials: true,
          headers
        }
      );
      
      // The response is already the appointments array
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for customer ${customerId}:`, error);
      throw error;
    }
  }
}

export default CustomersAPI; 