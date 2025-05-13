import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CustomerDto, AppointmentDto, PaginatedList } from '@/types';
import CustomersAPI from './customersAPI';
import { RootState } from '@/app/store';

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
  pageSize: 10,
  searchString: '',
  sortBy: 'LastName',
  sortAscending: true
};

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params: {
    pageNumber?: number;
    pageSize?: number;
    searchString?: string;
    sortBy?: string;
    sortAscending?: boolean;
  }, { getState }) => {
    const state = getState() as RootState;
    const tenantId = state.auth.tenant?.id;
    
    const response = await CustomersAPI.getCustomers({
      ...params,
      tenantId
    });
    
    return response.data;
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (customerId: string, { getState }) => {
    const state = getState() as RootState;
    const tenantId = state.auth.tenant?.id;
    
    const response = await CustomersAPI.getCustomerById(customerId, tenantId);
    return response.data;
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
    
    return response.data;
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, customerData }: { id: string; customerData: CustomerDto }) => {
    const response = await CustomersAPI.updateCustomer(id, customerData);
    return response.data;
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (customerId: string) => {
    await CustomersAPI.deleteCustomer(customerId);
    return customerId;
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
    }
  }, { getState }) => {
    const state = getState() as RootState;
    const tenantId = state.auth.tenant?.id;
    
    const response = await CustomersAPI.getCustomerAppointments(customerId, {
      ...params,
      tenantId
    });
    
    return response.data;
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
    }
  },
  extraReducers: (builder) => {
    // Handle fetchCustomers
    builder.addCase(fetchCustomers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomers.fulfilled, (state, action) => {
      state.loading = false;
      state.customersList = action.payload;
    });
    builder.addCase(fetchCustomers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch customers';
    });
    
    // Handle fetchCustomerById
    builder.addCase(fetchCustomerById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomerById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedCustomer = action.payload;
    });
    builder.addCase(fetchCustomerById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch customer details';
    });
    
    // Handle createCustomer
    builder.addCase(createCustomer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createCustomer.fulfilled, (state, action) => {
      state.loading = false;
      state.customersList.items.push(action.payload);
      state.customersList.totalCount += 1;
    });
    builder.addCase(createCustomer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create customer';
    });
    
    // Handle updateCustomer
    builder.addCase(updateCustomer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateCustomer.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.customersList.items.findIndex(customer => customer.id === action.payload.id);
      if (index !== -1) {
        state.customersList.items[index] = action.payload;
      }
      if (state.selectedCustomer && state.selectedCustomer.id === action.payload.id) {
        state.selectedCustomer = action.payload;
      }
    });
    builder.addCase(updateCustomer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update customer';
    });
    
    // Handle deleteCustomer
    builder.addCase(deleteCustomer.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteCustomer.fulfilled, (state, action) => {
      state.loading = false;
      state.customersList.items = state.customersList.items.filter(
        customer => customer.id !== action.payload
      );
      state.customersList.totalCount -= 1;
      if (state.selectedCustomer && state.selectedCustomer.id === action.payload) {
        state.selectedCustomer = null;
      }
    });
    builder.addCase(deleteCustomer.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to delete customer';
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
      state.error = action.error.message || 'Failed to fetch customer appointments';
    });
  }
});

export const { 
  clearSelectedCustomer, 
  setSearchString, 
  setSortBy, 
  setSortDirection,
  setPageSize 
} = customersSlice.actions;

export default customersSlice.reducer; 