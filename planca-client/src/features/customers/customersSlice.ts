import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CustomerDto, AppointmentDto, PaginatedList } from '@/types';
import CustomersAPI from './customersAPI';
import { RootState } from '@/app/store';
import { isHandling401Error } from '@/utils/axios';

// Son istek zamanını takip etmek için değişken
let lastFetchTime = 0;
// Debounce süresi (ms) - 300ms
const DEBOUNCE_TIME = 300;

// Silentrefresh için type tanımı güncellemesi
interface CustomersState {
  customersList: {
    items: CustomerDto[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  selectedCustomer: CustomerDto | null;
  customerAppointments: AppointmentDto[];
  loading: boolean;
  error: string | null;
  pageSize: number;
  searchString: string;
  sortBy: string;
  sortAscending: boolean;
}

// Sessiz yenileme için interface ekliyoruz
interface CustomersResponseWithSilentRefresh extends PaginatedList<CustomerDto> {
  silentRefresh?: boolean;
  error?: string;
}

const initialState: CustomersState = {
  customersList: {
    items: [],
    pageNumber: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  },
  selectedCustomer: null,
  customerAppointments: [],
  loading: false,
  error: null,
  pageSize: 6,
  searchString: '',
  sortBy: 'LastName',
  sortAscending: true
};

// Async thunks
export const fetchCustomers = createAsyncThunk<
  CustomersResponseWithSilentRefresh,
  {
    pageNumber?: number;
    pageSize?: number;
    searchString?: string;
    sortBy?: string;
    sortAscending?: boolean;
    forceRefresh?: boolean;
    silentRefresh?: boolean;
    suppressErrors?: boolean;
  },
  {state: RootState}
>(
  'customers/fetchCustomers',
  async (params, { getState }) => {
    const state = getState() as RootState;
    const tenantId = state.auth.tenant?.id;
    
    try {
      // Debounce kontrolü - art arda çağrıları sınırla
      const now = Date.now();
      if (!params.forceRefresh && now - lastFetchTime < DEBOUNCE_TIME) {
        console.log('Debouncing fetchCustomers call');
        const response = {
          ...state.customers.customersList
        } as CustomersResponseWithSilentRefresh;
        
        if (params.silentRefresh) {
          response.silentRefresh = true;
        }
        
        return response; // Mevcut listeyi kullan
      }
      
      // Son istek zamanını güncelle
      lastFetchTime = now;
      
      // forceRefresh parametresini skipCache olarak aktarıyoruz
      const skipCache = params.forceRefresh === true;
      
      console.log('Starting fetchCustomers with params:', {...params, skipCache});
      const apiResponse = await CustomersAPI.getCustomers({
        ...params,
        tenantId,
        skipCache,
        forceRefresh: params.forceRefresh
      });
      
      console.log('API response received from fetchCustomers');
      
      // API'den gelen yanıtı CustomersResponseWithSilentRefresh tipine dönüştür
      const response = {
        ...apiResponse
      } as CustomersResponseWithSilentRefresh;
      
      // Sessiz yenileme için ek alan
      if (params.silentRefresh) {
        response.silentRefresh = true;
      }
      
      // Data is now already normalized by the API class
      return response;
    } catch (error) {
      console.error('Error in fetchCustomers thunk:', error);
      // If silentRefresh or suppressErrors, handle error quietly
      if (params.silentRefresh || params.suppressErrors) {
        return {
          silentRefresh: true,
          error: error instanceof Error ? error.message : 'Bilinmeyen hata',
          items: [],
          pageNumber: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false
        } as CustomersResponseWithSilentRefresh;
      }
      // Convert to a rejected result
      return Promise.reject(error);
    }
  }
);

// Helper function to normalize customer data from backend format to frontend
const normalizeCustomerData = (customer: any): CustomerDto => {
  // Check if customer is null or undefined
  if (!customer) {
    console.warn('Null or undefined customer data received in normalizeCustomerData');
    return null as any;
  }
  
  try {
    // Use type assertion to handle different casing
    const customerAny = customer as any;
    
    // Convert PascalCase properties to camelCase if needed
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
  } catch (error) {
    console.error('Error normalizing customer data:', error, customer);
    return null as any;
  }
};

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (customerId: string, { getState }) => {
    const state = getState() as RootState;
    const tenantId = state.auth.tenant?.id;
    
    // Check if we already have this customer in the selectedCustomer state
    // If so, don't make an API call
    if (state.customers.selectedCustomer?.id === customerId) {
      console.log(`Customer ${customerId} already selected, skipping API call`);
      return state.customers.selectedCustomer;
    }
    
    const response = await CustomersAPI.getCustomerById(customerId, tenantId);
    console.log('Raw API response from fetchCustomerById:', response);
    
    // Data is now already normalized by the API class
    return response;
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData: Omit<CustomerDto, 'id'>, { getState }) => {
    const state = getState() as RootState;
    const tenantId = state.auth.tenant?.id;
    
    const response = await CustomersAPI.createCustomer({
      ...customerData,
      tenantId
    });
    
    return response;
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, customerData }: { id: string; customerData: CustomerDto }) => {
    const response = await CustomersAPI.updateCustomer(id, customerData);
    return response;
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (customerId: string) => {
    const success = await CustomersAPI.deleteCustomer(customerId);
    if (success) {
      return customerId;
    }
    throw new Error('Failed to delete customer');
  }
);

export const fetchCustomerAppointments = createAsyncThunk(
  'customers/fetchCustomerAppointments',
  async ({ customerId, params }: { 
    customerId: string; 
    params?: {
      startDate?: string;
      endDate?: string;
      status?: string;
      futureOnly?: boolean;
      pastOnly?: boolean;
      sortAscending?: boolean;
      skipCache?: boolean;
    }
  }, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const tenantId = state.auth.tenant?.id;
    
    // Combine parameters with tenant ID
    const combinedParams = {
      ...params,
      tenantId
    };
    
    try {
      // Log fetch parameters for debugging
      console.log(`Fetching appointments for customer ${customerId}`, combinedParams);
      
      const response = await CustomersAPI.getCustomerAppointments(customerId, combinedParams);
      return response;
    } catch (error) {
      console.error(`Error fetching appointments for customer ${customerId}:`, error);
      return rejectWithValue('Failed to fetch customer appointments');
    }
  }
);

// Create the slice
const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
      state.customerAppointments = [];
    },
    setSearchString: (state, action: PayloadAction<string>) => {
      state.searchString = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setSortDirection: (state, action: PayloadAction<boolean>) => {
      state.sortAscending = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    // Kullanıcı oturumu kapandığında veya tenant değiştiğinde tüm state'i temizle
    resetCustomers: () => {
      // API cache'i de temizle
      CustomersAPI.clearCache();
      // Tamamen yeni bir state döndür
      return initialState;
    }
  },
  extraReducers: (builder) => {
    // Handle fetchCustomers
    builder.addCase(fetchCustomers.pending, (state, action) => {
      // Eğer sessiz yenileme değilse loading durumunu değiştir
      if (!action.meta.arg.silentRefresh) {
        state.loading = true;
        state.error = null;
        console.log('fetchCustomers.pending - Loading state set to true');
      }
    });
    builder.addCase(fetchCustomers.fulfilled, (state, action) => {
      // Sessiz yenileme ise sadece veriyi güncelle, loading durumunu değiştirme
      if ((action.payload as any).silentRefresh) {
        console.log('Silent refresh completed, updating data without changing loading state');
      } else {
        state.loading = false;
      }
      
      console.log('fetchCustomers.fulfilled - payload:', action.payload);
      console.log('Payload type:', typeof action.payload);
      console.log('Has items:', action.payload && 'items' in action.payload);
      
      // Ensure we handle empty or invalid responses
      if (!action.payload) {
        console.log('No payload received, using initialState');
        state.customersList = initialState.customersList;
        return;
      }
      
      // Make sure items are properly initialized even if the API returns null
      console.log('Building customersList from payload');
      try {
        state.customersList = {
          items: action.payload.items?.map((item: any) => {
            console.log('Processing item:', item);
            return normalizeCustomerData(item);
          }).filter(Boolean) || [],
          pageNumber: action.payload.pageNumber || 1,
          totalPages: action.payload.totalPages || 0,
          totalCount: action.payload.totalCount || 0,
          hasNextPage: action.payload.hasNextPage || false,
          hasPreviousPage: action.payload.hasPreviousPage || false
        };
        console.log('Final customersList state:', state.customersList);
      } catch (error) {
        console.error('Error processing customers data:', error);
        state.error = 'Failed to process customers data';
        state.customersList = initialState.customersList;
      }
    });
    builder.addCase(fetchCustomers.rejected, (state, action) => {
      // Sessiz yenileme ise hatayı gösterme
      if (action.meta.arg.silentRefresh) {
        console.log('Silent refresh error, not updating state');
        return;
      }
      
      state.loading = false;
      
      // Only set error if we're not handling a 401 error with auto-refresh
      if (!isHandling401Error()) {
        state.error = action.error.message || 'Failed to fetch customers';
      }
    });
    
    // Handle fetchCustomerById
    builder.addCase(fetchCustomerById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomerById.fulfilled, (state, action) => {
      state.loading = false;
      console.log('fetchCustomerById.fulfilled, normalized data:', action.payload);
      if (action.payload) {
        state.selectedCustomer = action.payload;
      } else {
        state.error = 'Failed to retrieve customer details';
        // Müşteri bulunamadıysa selected customer'ı temizleyelim
        state.selectedCustomer = null;
      }
    });
    builder.addCase(fetchCustomerById.rejected, (state, action) => {
      state.loading = false;
      // Only set error if we're not handling a 401 error with auto-refresh
      if (!isHandling401Error()) {
        state.error = action.error.message || 'Failed to fetch customer details';
        // Müşteri bulunamadığında state'i temizleyelim
        state.selectedCustomer = null;
      }
    });
    
    // Handle createCustomer
    builder.addCase(createCustomer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCustomer.fulfilled, (state, action) => {
      state.loading = false;
      
      // Only proceed if we have valid customer data
      if (!action.payload) {
        state.error = 'Failed to create customer: No data returned';
        return;
      }
      
      // Ensure customersList is initialized
      if (!state.customersList) {
        state.customersList = {
          items: [],
          pageNumber: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false
        };
      }
      
      // Make sure items array exists
      if (!state.customersList.items) {
        state.customersList.items = [];
      }
      
      // Add new customer to items array
      state.customersList.items.push(action.payload);
      state.customersList.totalCount = (state.customersList.totalCount || 0) + 1;
    });
    builder.addCase(createCustomer.rejected, (state, action) => {
      state.loading = false;
      // Only set error if we're not handling a 401 error with auto-refresh
      if (!isHandling401Error()) {
        state.error = action.error.message || 'Failed to create customer';
      }
    });
    
    // Handle updateCustomer
    builder.addCase(updateCustomer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCustomer.fulfilled, (state, action) => {
      state.loading = false;
      
      // Only proceed if we have valid customer data
      if (!action.payload) {
        state.error = 'Failed to update customer: No data returned';
        return;
      }
      
      // Ensure customersList is initialized
      if (!state.customersList || !state.customersList.items) {
        return;
      }
      
      // At this point we've validated that action.payload is not null
      const customer = action.payload;
      
      const index = state.customersList.items.findIndex(item => item && item.id === customer.id);
      if (index !== -1) {
        state.customersList.items[index] = customer;
      }
      if (state.selectedCustomer && state.selectedCustomer.id === customer.id) {
        state.selectedCustomer = customer;
      }
    });
    builder.addCase(updateCustomer.rejected, (state, action) => {
      state.loading = false;
      // Only set error if we're not handling a 401 error with auto-refresh
      if (!isHandling401Error()) {
        state.error = action.error.message || 'Failed to update customer';
      }
    });
    
    // Handle deleteCustomer
    builder.addCase(deleteCustomer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCustomer.fulfilled, (state, action) => {
      state.loading = false;
      
      // Ensure customersList is initialized
      if (!state.customersList || !state.customersList.items) {
        return;
      }
      
      state.customersList.items = state.customersList.items.filter(
        customer => customer.id !== action.payload
      );
      if (state.customersList.totalCount !== undefined) {
        state.customersList.totalCount -= 1;
      }
      if (state.selectedCustomer && state.selectedCustomer.id === action.payload) {
        state.selectedCustomer = null;
      }
    });
    builder.addCase(deleteCustomer.rejected, (state, action) => {
      state.loading = false;
      // Only set error if we're not handling a 401 error with auto-refresh
      if (!isHandling401Error()) {
        state.error = action.error.message || 'Failed to delete customer';
      }
    });
    
    // Handle fetchCustomerAppointments
    builder.addCase(fetchCustomerAppointments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomerAppointments.fulfilled, (state, action) => {
      state.loading = false;
      state.customerAppointments = action.payload;
    });
    builder.addCase(fetchCustomerAppointments.rejected, (state, action) => {
      state.loading = false;
      // Hata göstermek yerine boş bir array atıyoruz
      state.customerAppointments = [];
      // Error durumunu değiştirmiyoruz, böylece diğer hataları göstermeye devam ediyoruz
      // state.error = action.error.message || 'Failed to fetch customer appointments';
    });
  }
});

export const { 
  clearSelectedCustomer, 
  setSearchString, 
  setSortBy, 
  setSortDirection,
  setPageSize,
  resetCustomers
} = customersSlice.actions;

export default customersSlice.reducer; 