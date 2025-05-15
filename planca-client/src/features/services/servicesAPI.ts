import axios from '@/utils/axios';
import { ApiResponse, PaginatedList, ServiceDto } from '@/types';

/**
 * Services API endpoints and methods
 */
class ServicesAPI {
  private static readonly ENDPOINT = '/Services';

  /**
   * Get a paginated list of services with optional filtering
   */
  static async getServices(params: {
    pageNumber?: number;
    pageSize?: number;
    searchString?: string;
    isActive?: boolean;
    maxPrice?: number;
    sortBy?: string;
    sortAscending?: boolean;
    tenantId?: string;
  }) {
    try {
      console.log('Fetching services with params:', params);
      
      // Make sure we have the tenant ID
      if (!params.tenantId) {
        console.warn('No tenantId provided for services fetch, this may cause empty results');
      }
      
      // Önbellek engelleme için timestamp ekleyelim
      const timestamp = new Date().getTime();
      
      // Convert params to match API's expected PascalCase naming
      const apiParams: Record<string, any> = {
        PageNumber: params.pageNumber,
        PageSize: params.pageSize,
        SortBy: params.sortBy,
        SortAscending: params.sortAscending,
        TenantId: params.tenantId,
        _t: timestamp // Önbellek engelleme için timestamp ekle
      };
      
      // Only add search parameters if they have actual values
      if (params.searchString && params.searchString.trim() !== '') {
        apiParams['SearchString'] = params.searchString;
      }
      
      if (params.isActive !== undefined) {
        apiParams['IsActive'] = params.isActive;
      }
      
      if (params.maxPrice !== undefined) {
        apiParams['MaxPrice'] = params.maxPrice;
      }
      
      console.log('Sending API request with formatted params:', apiParams);
      
      // HTTP isteği için headers hazırla
      const headers: Record<string, string> = {};
      if (params.tenantId) {
        headers['X-TenantId'] = params.tenantId;
      }
      
      const response = await axios.get<ApiResponse<PaginatedList<ServiceDto>>>(
        ServicesAPI.ENDPOINT,
        { 
          params: apiParams, 
          withCredentials: true,
          headers
        }
      );
      
      console.log('Services API raw response:', response);
      console.log('Services API response data:', response.data);
      
      // Check if we got an empty response
      if (!response.data) {
        console.error('Services API returned completely empty response');
        return { data: { items: [], pageNumber: 1, totalPages: 0, totalCount: 0, hasNextPage: false, hasPreviousPage: false } };
      }
      
      // API yanıtının yapısına göre işlem yapma
      const responseData = response.data as any; // Tür kontrolü için 'any' kullanıyoruz
      
      // Doğrudan listeyi içeren bir yanıt mı?
      if (responseData.items && Array.isArray(responseData.items)) {
        console.log('API yanıtı doğrudan PaginatedList yapısında:', responseData);
        // API doğrudan items içeren bir yapı döndürdü
        return { 
          succeeded: true,
          data: responseData 
        };
      }
      
      // ApiResponse<PaginatedList> formatında bir yanıt mı?
      if (responseData.data && responseData.data.items && Array.isArray(responseData.data.items)) {
        console.log('API yanıtı ApiResponse<PaginatedList> yapısında:', responseData.data);
        
        // DurationMinutes alanını düzelt
        responseData.data.items = responseData.data.items.map((service: any) => ({
          ...service,
          durationMinutes: service.durationMinutes || service.durationminutes
        }));
        
        return responseData;
      }
      
      // Beklenmeyen bir yanıt durumunda boş yanıt döndür
      console.error('API unexpected response format:', responseData);
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
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Get a single service by ID
   */
  static async getServiceById(id: string, tenantId?: string) {
    try {
      // If tenantId is provided, add it as a query parameter
      const params = tenantId ? { TenantId: tenantId } : {};
      
      const response = await axios.get<ApiResponse<ServiceDto>>(
        `${ServicesAPI.ENDPOINT}/${id}`,
        { params, withCredentials: true }
      );
      
      // Process the data to ensure durationMinutes matches durationminutes from CSV
      if (response.data.data) {
        response.data.data = {
          ...response.data.data,
          durationMinutes: response.data.data.durationMinutes || (response.data.data as any).durationminutes
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new service
   */
  static async createService(serviceData: Omit<ServiceDto, 'id'>) {
    try {
      console.log('createService called with:', serviceData);
      
      // TenantId kontrolü
      if (!serviceData.tenantId) {
        console.warn('Creating service without tenantId! This may cause the service to not appear.');
      }
      
      // Create a clean object with ONLY PascalCase properties
      // This prevents duplicates like both tenantId and TenantId
      const transformedData = {
        Name: serviceData.name,
        Description: serviceData.description,
        Color: serviceData.color,
        Price: serviceData.price,
        DurationMinutes: serviceData.durationMinutes,
        IsActive: serviceData.isActive,
        TenantId: serviceData.tenantId
      };
      
      console.log('Sending transformed data to API:', transformedData);
      console.log('IMPORTANT: Check if only PascalCase properties exist:', Object.keys(transformedData));
      
      const response = await axios.post<ApiResponse<ServiceDto>>(
        ServicesAPI.ENDPOINT,
        transformedData,
        { withCredentials: true }
      );
      
      console.log('Service creation raw response:', response);
      
      if (!response.data) {
        console.error('Empty response from create service API');
        return { succeeded: true, data: {} as ServiceDto };
      }
      
      const createdService = response.data;
      console.log('Service created successfully:', createdService);
      
      // Tutarlı bir dönüş formatı sağla
      if (createdService.data === undefined && createdService.succeeded === undefined) {
        // API doğrudan ServiceDto döndürmüş
        return {
          succeeded: true,
          data: createdService as any
        };
      }
      
      return createdService;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  /**
   * Update an existing service
   */
  static async updateService(id: string, serviceData: ServiceDto) {
    try {
      // Create a clean object with ONLY PascalCase properties
      // This prevents duplicates like both tenantId and TenantId
      const transformedData = {
        Id: serviceData.id,
        Name: serviceData.name,
        Description: serviceData.description,
        Color: serviceData.color,
        Price: serviceData.price,
        DurationMinutes: serviceData.durationMinutes,
        IsActive: serviceData.isActive,
        TenantId: serviceData.tenantId
      };
      
      console.log('Updating service with data:', transformedData);
      console.log('IMPORTANT: Check if only PascalCase properties exist:', Object.keys(transformedData));
      
      const response = await axios.put<ApiResponse<ServiceDto>>(
        `${ServicesAPI.ENDPOINT}/${id}`,
        transformedData,
        { withCredentials: true }
      );
      
      console.log('Update service API response:', response);
      
      // API yanıt kontrolü
      if (!response.data) {
        console.error('Empty response from update service API');
        throw new Error('Empty response from server');
      }
      
      // Response data'nın formatını kontrol edelim
      const responseData = response.data;
      
      // API başarılı bir yanıt döndürdü mü?
      if (responseData.succeeded === false) {
        console.error('Service update failed:', responseData.message || 'Unknown error');
        throw new Error(responseData.message || 'Service update failed');
      }
      
      // ApiResponse<ServiceDto> formatında mı? yoksa doğrudan ServiceDto mu?
      if (responseData.data !== undefined) {
        // ApiResponse formatı
        console.log('API returned ApiResponse format with data');
        // ID kontrolü yap
        if (!responseData.data.id) {
          console.warn('API returned service without ID, using original ID');
          responseData.data.id = id; // Orijinal ID'yi kullan
        }
        return responseData;
      } else if ((responseData as any).id) {
        // Doğrudan ServiceDto formatı 
        console.log('API returned direct ServiceDto format');
        return {
          succeeded: true,
          data: responseData as any
        };
      } else {
        // Beklenmeyen format, ancak orijinal servisi geri dönelim
        console.warn('API returned unexpected format, using original service data with updated fields');
        return {
          succeeded: true,
          data: {
            ...serviceData,
            // API yanıtından alabileceğimiz alanları ekleyelim
            ...responseData
          }
        };
      }
    } catch (error: any) {
      console.error(`Error updating service ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a service
   */
  static async deleteService(id: string, tenantId?: string) {
    try {
      // If tenantId is provided, add it as a query parameter
      const params = tenantId ? { TenantId: tenantId } : {};
      
      const response = await axios.delete<ApiResponse<boolean>>(
        `${ServicesAPI.ENDPOINT}/${id}`,
        { params, withCredentials: true }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      throw error;
    }
  }
}

// Export functions that correctly maintain the class context
export const getServices = ServicesAPI.getServices.bind(ServicesAPI);
export const getServiceById = ServicesAPI.getServiceById.bind(ServicesAPI);
export const createService = ServicesAPI.createService.bind(ServicesAPI);
export const updateService = ServicesAPI.updateService.bind(ServicesAPI);
export const deleteService = ServicesAPI.deleteService.bind(ServicesAPI);

export default ServicesAPI; 