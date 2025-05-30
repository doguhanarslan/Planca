import axios from '@/shared/api/base/axios';
import { ApiResponse, PaginatedList, CustomerDto, AppointmentDto } from '@/shared/types';

/**
 * Valid SortBy values for Customers API (based on debug info)
 */
const VALID_CUSTOMER_SORT_VALUES = {
  'firstName': 'FirstName',
  'firstname': 'FirstName',
  'FirstName': 'FirstName',
  'lastName': 'LastName', 
  'lastname': 'LastName',
  'LastName': 'LastName',
  'email': 'Email',
  'Email': 'Email',
  'createdAt': 'CreatedAt',
  'createdat': 'CreatedAt',
  'CreatedAt': 'CreatedAt',
  // Default fallback for invalid values
  'name': 'LastName', // Map invalid 'name' to valid 'LastName' for customers
  'Name': 'LastName',
  'fullName': 'LastName',
  'fullname': 'LastName',
} as const;

/**
 * Valid SortBy values for Appointments API
 */
const VALID_APPOINTMENT_SORT_VALUES = {
  'startTime': 'StartTime',
  'starttime': 'StartTime',
  'StartTime': 'StartTime', 
  'endTime': 'EndTime',
  'endtime': 'EndTime',
  'EndTime': 'EndTime',
  'createdAt': 'CreatedAt',
  'createdat': 'CreatedAt',
  'CreatedAt': 'CreatedAt',
  'status': 'Status',
  'Status': 'Status',
  // Default fallback
  'name': 'StartTime',
  'Name': 'StartTime',
} as const;

/**
 * Customers API endpoints and methods
 */
class CustomersAPI {
  private static readonly ENDPOINT = '/Customers';
  
  // Cache for paginated customers
  private static customerCache: Map<string, { 
    data: PaginatedList<CustomerDto>;
    timestamp: number; 
  }> = new Map();
  
  // New cache for individual customer details
  private static customerDetailsCache: Map<string, {
    data: CustomerDto;
    timestamp: number;
  }> = new Map();
  
  // New cache for customer appointments
  private static appointmentsCache: Map<string, {
    data: AppointmentDto[];
    timestamp: number;
  }> = new Map();
  
  // En son kullanılan tenantId
  private static lastTenantId: string | null = null;
  
  // Cache süresi (ms) - 2 dakika
  private static readonly CACHE_DURATION = 2 * 60 * 1000;

  /**
   * Transform and validate SortBy parameter for Customers API
   */
  private static transformCustomerSortBy(sortBy?: string): string {
    if (!sortBy) return 'LastName'; // Default for customers
    
    // Check if the sortBy value is valid
    const validValue = VALID_CUSTOMER_SORT_VALUES[sortBy as keyof typeof VALID_CUSTOMER_SORT_VALUES];
    if (validValue) {
      return validValue;
    }
    
    // Default fallback
    console.warn(`Invalid SortBy value for customers: ${sortBy}. Using LastName instead.`);
    return 'LastName';
  }

  /**
   * Transform and validate SortBy parameter for Appointments API
   */
  private static transformAppointmentSortBy(sortBy?: string): string {
    if (!sortBy) return 'StartTime'; // Default for appointments
    
    // Check if the sortBy value is valid
    const validValue = VALID_APPOINTMENT_SORT_VALUES[sortBy as keyof typeof VALID_APPOINTMENT_SORT_VALUES];
    if (validValue) {
      return validValue;
    }
    
    // Default fallback
    console.warn(`Invalid SortBy value for appointments: ${sortBy}. Using StartTime instead.`);
    return 'StartTime';
  }

  /**
   * Önbelleği tamamen temizle ve son tenantId'yi sıfırla
   * Bu metod auth işlemleri veya tenant değişikliklerinde çağrılabilir
   */
  public static clearCache(): void {
    console.log('Customer cache tamamen temizleniyor');
    CustomersAPI.customerCache.clear();
    CustomersAPI.customerDetailsCache.clear();
    CustomersAPI.appointmentsCache.clear();
    CustomersAPI.lastTenantId = null;
  }

  /**
   * Önbellekte bu sorgu sonucu var mı kontrol et
   */
  private static getCachedCustomers(cacheKey: string): PaginatedList<CustomerDto> | null {
    const cached = this.customerCache.get(cacheKey);
    if (!cached) return null;
    
    // Cache süresini kontrol et
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      // Cache süresi dolmuş, temizle
      this.customerCache.delete(cacheKey);
      return null;
    }
    console.log('>> CACHE HIT: Customers verileri önbellekten alınıyor, API isteği yapılmayacak.)',cached.data);
    return cached.data;
  }
  
  /**
   * Sorgu sonucunu önbelleğe kaydet
   */
  private static cacheCustomers(cacheKey: string, data: PaginatedList<CustomerDto>): void {
    // Basit cache boyut kontrolü - cache çok büyürse en eskiyi sil
    if (this.customerCache.size > 20) {
      const oldestKey = this.customerCache.keys().next().value;
      if (oldestKey) {
        this.customerCache.delete(oldestKey);
      }
    }
    
    this.customerCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }
  
  /**
   * Cache için benzersiz anahtar oluştur
   */
  private static createCacheKey(params: Record<string, any>): string {
    return Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
  }

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
    skipCache?: boolean;
    forceRefresh?: boolean;
  }) {
    try {
      // TenantId izlemesini kaldırıyoruz - Redux bu işi yapacak
      // Sadece mevcut TenantId'yi kaydediyoruz
      this.lastTenantId = params.tenantId || null;
      
      // Convert params to match API's expected PascalCase naming
      const apiParams: Record<string, any> = {
        PageNumber: params.pageNumber || 1,
        PageSize: params.pageSize || 10,
        // FIX: Use validated SortBy parameter
        SortBy: this.transformCustomerSortBy(params.sortBy),
        SortAscending: params.sortAscending !== false
      };
      
      // Only add search parameter if it has an actual value
      if (params.searchString && params.searchString.trim() !== '') {
        apiParams['SearchString'] = params.searchString;
      }
      
      // Cache anahtarı oluştur
      const cacheKey = this.createCacheKey(apiParams);
      
      // Cache'i kontrol et (skipCache false ise)
      if (!params.skipCache) {
        const cachedData = this.getCachedCustomers(cacheKey);
        if (cachedData) {
          console.log('>> CACHE HIT: Customers verileri önbellekten alınıyor, API isteği yapılmayacak. [TenantId:', params.tenantId, ']');
          return cachedData;
        }
      }
      
      // Gerçek API isteği yapılacaksa timestamp ekle
      apiParams['_t'] = new Date().getTime(); // Timestamp to prevent caching
      
      // Set up headers
      const headers: Record<string, string> = {};
      if (params.tenantId) {
        headers['X-TenantId'] = params.tenantId;
      }
      
      console.log('>> API CALL: Customers verileri API\'den getiriliyor... [TenantId:', params.tenantId, ']');
      console.log('API Params:', apiParams); // Debug log for API params
      
      const response = await axios.get<PaginatedList<CustomerDto>>(
        CustomersAPI.ENDPOINT,
        { 
          params: apiParams, 
          withCredentials: true,
          headers
        }
      );
      
      console.log('API Response from getCustomers:', response.data);
      
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
            lastName: customer.lastName || customerAny.LastName || '' || 'LastName' || 'lastName',
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
      
      // Sonucu önbelleğe kaydet
      this.cacheCustomers(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error fetching customers:', error);
      
      // Return a reasonable fallback structure instead of throwing an error
      // This helps the UI recover gracefully from errors
      if (params.forceRefresh !== true) {
        // Try to get any cached data as a fallback
        const apiParams: Record<string, any> = {
          PageNumber: params.pageNumber || 1,
          PageSize: params.pageSize || 10,
          // FIX: Use validated SortBy parameter in fallback too
          SortBy: this.transformCustomerSortBy(params.sortBy),
          SortAscending: params.sortAscending !== false
        };
        
        if (params.searchString && params.searchString.trim() !== '') {
          apiParams['SearchString'] = params.searchString;
        }
        
        const cacheKey = this.createCacheKey(apiParams);
        const cachedData = this.getCachedCustomers(cacheKey);
        
        if (cachedData) {
          console.log('Using cached data as fallback after API error');
          return cachedData;
        }
      }
      
      // If no cache or cache is being forcibly bypassed, return empty result structure
      console.log('Returning empty fallback structure after API error');
      return {
        items: [],
        pageNumber: params.pageNumber || 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  }

  /**
   * Get a cached customer detail by ID, or null if not found
   */
  private static getCachedCustomerDetail(id: string): CustomerDto | null {
    const cacheEntry = this.customerDetailsCache.get(id);
    
    if (!cacheEntry) {
      return null;
    }
    
    const now = Date.now();
    if (now - cacheEntry.timestamp > this.CACHE_DURATION) {
      // Cache expired
      this.customerDetailsCache.delete(id);
      return null;
    }
    
    return cacheEntry.data;
  }
  
  /**
   * Cache customer detail
   */
  private static cacheCustomerDetail(id: string, data: CustomerDto): void {
    this.customerDetailsCache.set(id, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get a single customer by ID
   */
  static async getCustomerById(id: string, tenantId?: string, skipCache: boolean = false) {
    try {
      // Check cache first if not explicitly skipping cache
      if (!skipCache) {
        const cachedCustomer = this.getCachedCustomerDetail(id);
        if (cachedCustomer) {
          console.log(`Using cached data for customer ${id}`);
          return cachedCustomer;
        }
      }
      
      const headers: Record<string, string> = {};
      if (tenantId) {
        headers['X-TenantId'] = tenantId;
      }
      
      console.log(`Making API call to get customer ${id}`);
      
      try {
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
          
          // Cache the normalized customer data
          this.cacheCustomerDetail(id, normalizedCustomer);
          
          return normalizedCustomer;
        }
        
        // Veri eksik veya geçersizse null dön ve uygun hata mesajı oluştur
        console.warn(`Customer ${id} data is invalid or empty`);
        throw new Error(`Müşteri bilgileri bulunamadı (ID: ${id})`);
      } catch (axiosError: any) {
        // Axios hata durumlarını daha detaylı işle
        if (axiosError.response) {
          // Sunucu cevap verdi ama 2xx dışında bir hata kodu döndü
          if (axiosError.response.status === 404) {
            console.warn(`Customer ${id} not found (404)`);
            throw new Error(`Müşteri bulunamadı (ID: ${id})`);
          } else {
            console.error(`API error for customer ${id}:`, axiosError.response.status, axiosError.response.data);
            throw new Error(`Müşteri bilgileri alınırken bir hata oluştu (${axiosError.response.status})`);
          }
        } else if (axiosError.request) {
          // İstek yapıldı ama sunucudan yanıt gelmedi
          console.error(`No response from server for customer ${id}:`, axiosError.request);
          throw new Error('Sunucudan yanıt alınamadı. Lütfen internet bağlantınızı kontrol edin.');
        } else {
          // İstek oluşturulurken hata oldu
          console.error(`Error creating request for customer ${id}:`, axiosError.message);
          throw axiosError;
        }
      }
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
        FirstName: customerData.firstName || 'FirstName',
        LastName: customerData.lastName || 'LastName',
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
      
      // Yeni bir müşteri oluşturulduğunda cache'i temizle
      this.customerCache.clear();
      
      // The response is already the customer data
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Clear cache for a specific customer
   */
  private static clearCustomerCache(customerId: string): void {
    // Remove from details cache
    this.customerDetailsCache.delete(customerId);
    
    // Remove from appointments cache (any keys starting with customerId)
    for (const key of this.appointmentsCache.keys()) {
      if (key.startsWith(`${customerId}_`)) {
        this.appointmentsCache.delete(key);
      }
    }
    
    console.log(`Cache cleared for customer ${customerId}`);
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
      
      // Müşteri güncellendiğinde cache'i temizle
      this.clearCustomerCache(id);
      
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
      
      // Müşteri silindiğinde cache'i temizle
      this.clearCustomerCache(id);
      
      // Just return success status
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create appointment cache key
   */
  private static createAppointmentCacheKey(customerId: string, params: Record<string, any>): string {
    // Sort keys to ensure consistent cache key
    const sortedParams = Object.keys(params).sort().reduce((result, key) => {
      if (params[key] !== undefined && key !== 'tenantId' && key !== '_t') {
        result[key] = params[key];
      }
      return result;
    }, {} as Record<string, any>);
    
    return `${customerId}_${JSON.stringify(sortedParams)}`;
  }
  
  /**
   * Get cached customer appointments
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
   * Cache customer appointments
   */
  private static cacheAppointments(cacheKey: string, data: AppointmentDto[]): void {
    this.appointmentsCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
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
    sortBy?: string;
    tenantId?: string;
    skipCache?: boolean;
  } = {}) {
    try {
      // Generate cache key
      const skipCache = params.skipCache === true;
      const cacheKey = this.createAppointmentCacheKey(customerId, params);
      
      // Check cache if not skipping
      if (!skipCache) {
        const cachedAppointments = this.getCachedAppointments(cacheKey);
        if (cachedAppointments) {
          console.log(`Using cached appointments for customer ${customerId}`);
          return cachedAppointments;
        }
      }
      
      // Gerçek API isteği
      const apiParams: Record<string, any> = {
        _t: new Date().getTime()
      };
      
      // İsteğe bağlı parametreleri ekle
      if (params.startDate) apiParams.startDate = params.startDate;
      if (params.endDate) apiParams.endDate = params.endDate;
      if (params.status) apiParams.status = params.status;
      if (params.futureOnly) apiParams.futureOnly = params.futureOnly;
      if (params.pastOnly) apiParams.pastOnly = params.pastOnly;
      if (params.sortAscending !== undefined) apiParams.sortAscending = params.sortAscending;
      
      // FIX: Use validated SortBy parameter for appointments
      if (params.sortBy) {
        apiParams.sortBy = this.transformAppointmentSortBy(params.sortBy);
      }

      const headers: Record<string, string> = {};
      if (params.tenantId) {
        headers['X-TenantId'] = params.tenantId;
      }
      
      console.log(`Making API call for appointments - customer ${customerId}`);
      console.log('Appointments API Params:', apiParams); // Debug log for API params
      
      const response = await axios.get<AppointmentDto[]>(
        `/Appointments/customer/${customerId}`,
        { 
          params: apiParams,
          withCredentials: true,
          headers
        }
      );
      
      // Cache the appointments
      this.cacheAppointments(cacheKey, response.data);
      
      // Return the appointments
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for customer ${customerId}:`, error);
      throw error;
    }
  }
}

export default CustomersAPI;