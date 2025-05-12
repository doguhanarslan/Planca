import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ServiceDto, PaginatedList } from '@/types';
import { 
  getServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService 
} from './servicesAPI';

// Interface defining the services state
interface ServicesState {
  services: ServiceDto[];
  selectedService: ServiceDto | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  isFiltered: boolean;
  filters: {
    searchString?: string;
    isActive?: boolean;
    maxPrice?: number;
    sortBy?: string;
    sortAscending?: boolean;
  };
}

// Initial state
const initialState: ServicesState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  isFiltered: false,
  filters: {
    searchString: '',
    isActive: undefined,
    maxPrice: undefined,
    sortBy: 'name',
    sortAscending: true
  }
};

// Properly format sort fields to match backend requirements
const getSortField = (field?: string): string | undefined => {
  if (!field) return undefined;
  
  switch (field.toLowerCase()) {
    case 'name': return 'Name';
    case 'price': return 'Price';
    case 'duration': 
    case 'durationminutes': return 'Duration';
    case 'createdat': return 'CreatedAt';
    default: return 'Name';
  }
};

// Async thunks
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { 
        services: ServicesState,
        auth: { tenant?: { id: string }, tenantId?: string }
      };
      const { pageNumber, pageSize, filters } = state.services;
      
      // Get tenant ID from auth state
      const tenantId = state.auth.tenant?.id || state.auth.tenantId;
      console.log('Using tenantId for fetch:', tenantId);
      
      const response = await getServices({
        pageNumber,
        pageSize,
        searchString: filters.searchString,
        isActive: filters.isActive,
        maxPrice: filters.maxPrice,
        sortBy: getSortField(filters.sortBy),
        sortAscending: filters.sortAscending,
        tenantId // Add tenantId to ensure proper filtering
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchServiceById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getServiceById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service');
    }
  }
);

export const addService = createAsyncThunk(
  'services/addService',
  async (service: Omit<ServiceDto, 'id'>, { rejectWithValue, getState }) => {
    try {
      // Log service data
      console.log('Creating service with data:', service);

      const state = getState() as { 
        auth: { tenant?: { id: string }, tenantId?: string }
      };
      
      // Tenant ID check
      const tenantId = service.tenantId || state.auth.tenant?.id || state.auth.tenantId || '';
      console.log('Using tenantId for create:', tenantId);
      
      // Create service data without duplication
      // We'll let the API handle the transformation to PascalCase
      const serviceData = {
        ...service,
        tenantId: tenantId
      } as Omit<ServiceDto, 'id'>;
      
      console.log('Final service data being sent:', serviceData);
      
      const response = await createService(serviceData);
      console.log('Create service API response:', response);
      
      if (!response.data) {
        console.error('Create service API returned empty data');
        return rejectWithValue('Empty response data');
      }
      
      console.log('Created service:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in addService thunk:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create service');
    }
  }
);

export const editService = createAsyncThunk(
  'services/editService',
  async (service: ServiceDto, { rejectWithValue }) => {
    try {
      const response = await updateService(service.id, service);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update service');
    }
  }
);

export const removeService = createAsyncThunk(
  'services/removeService',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteService(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
    }
  }
);

// Services slice
const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setSelectedService: (state, action: PayloadAction<ServiceDto | null>) => {
      state.selectedService = action.payload;
    },
    setPageNumber: (state, action: PayloadAction<number>) => {
      state.pageNumber = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    setSearchString: (state, action: PayloadAction<string | undefined>) => {
      state.filters.searchString = action.payload;
      state.isFiltered = !!action.payload || state.filters.isActive !== undefined || state.filters.maxPrice !== undefined;
    },
    setIsActive: (state, action: PayloadAction<boolean | undefined>) => {
      state.filters.isActive = action.payload;
      state.isFiltered = !!state.filters.searchString || state.filters.isActive !== undefined || state.filters.maxPrice !== undefined;
    },
    setMaxPrice: (state, action: PayloadAction<number | undefined>) => {
      state.filters.maxPrice = action.payload;
      state.isFiltered = !!state.filters.searchString || state.filters.isActive !== undefined || state.filters.maxPrice !== undefined;
    },
    setSortBy: (state, action: PayloadAction<string | undefined>) => {
      state.filters.sortBy = action.payload;
    },
    setSortDirection: (state, action: PayloadAction<boolean>) => {
      state.filters.sortAscending = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.isFiltered = false;
      state.pageNumber = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch services
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        console.log('fetchServices fulfilled with payload:', action.payload);
        
        if (action.payload) {
          try {
            // Handle both ApiResponse<PaginatedList> and direct PaginatedList structures
            const payload = action.payload as any;
            
            console.log('Raw payload structure:', JSON.stringify(payload).slice(0, 100) + '...');
            console.log('Full payload totalCount:', payload.totalCount, 'items length:', payload.items?.length);
            
            // 1. API yanıtı ya direkt PaginatedList ya da ApiResponse<PaginatedList> formatında olabilir
            let responseData;
            
            if (payload.succeeded !== undefined && payload.data !== undefined) {
              // ApiResponse formatı
              console.log('Payload is ApiResponse format with data property');
              console.log('ApiResponse data totalCount:', payload.data.totalCount, 'items length:', payload.data.items?.length);
              responseData = payload.data;
            } else if (payload.items !== undefined) {
              // Doğrudan PaginatedList formatı
              console.log('Payload is direct PaginatedList format');
              responseData = payload;
            } else {
              console.error('Unknown payload format:', payload);
              responseData = { items: [] };
            }
            
            console.log('Final responseData format:', responseData);
            console.log('Final totalCount:', responseData.totalCount, 'items length:', responseData.items?.length);
            
            if (responseData && responseData.items && Array.isArray(responseData.items)) {
              // İşlenebilir veri yapısı
              console.log(`Found ${responseData.items.length} services in response`);
              
              state.services = responseData.items;
              state.totalCount = responseData.totalCount || 0;
              state.pageNumber = responseData.pageNumber || 1;
              state.totalPages = responseData.totalPages || 1;
              
              console.log('Updated state values:', {
                servicesLength: state.services.length,
                totalCount: state.totalCount,
                pageNumber: state.pageNumber,
                totalPages: state.totalPages
              });
            } else {
              console.error('Invalid response data structure:', responseData);
              state.services = [];
              state.totalCount = 0;
              state.totalPages = 1;
            }
          } catch (error) {
            console.error('Error processing services data:', error);
            state.services = [];
          }
        } else {
          console.error('No payload in fetchServices.fulfilled');
          state.services = [];
        }
        state.loading = false;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch service by ID
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.selectedService = action.payload as ServiceDto;
        state.loading = false;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add service
      .addCase(addService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addService.fulfilled, (state, action) => {
        console.log('addService.fulfilled with data:', action.payload);
        // Add to list only if we're on the first page, otherwise will be fetched with next page load
        if (state.pageNumber === 1 && state.services.length < state.pageSize) {
          state.services.push(action.payload as ServiceDto);
          console.log('Service added to state, new services count:', state.services.length);
        }
        state.selectedService = action.payload as ServiceDto;
        state.totalCount += 1;
        state.loading = false;
      })
      .addCase(addService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Edit service
      .addCase(editService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editService.fulfilled, (state, action) => {
        const updatedService = action.payload as ServiceDto;
        state.services = state.services.map(service => 
          service.id === updatedService.id ? updatedService : service
        );
        state.selectedService = updatedService;
        state.loading = false;
      })
      .addCase(editService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Remove service
      .addCase(removeService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeService.fulfilled, (state, action) => {
        const serviceId = action.payload as string;
        state.services = state.services.filter(service => service.id !== serviceId);
        if (state.selectedService?.id === serviceId) {
          state.selectedService = null;
        }
        state.totalCount -= 1;
        state.loading = false;
      })
      .addCase(removeService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  setSelectedService,
  setPageNumber,
  setPageSize,
  setSearchString,
  setIsActive,
  setMaxPrice,
  setSortBy,
  setSortDirection,
  resetFilters
} = servicesSlice.actions;

export default servicesSlice.reducer; 