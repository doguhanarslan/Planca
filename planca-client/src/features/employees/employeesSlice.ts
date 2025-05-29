import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EmployeeDto, PaginatedList } from '@/shared/types';
import EmployeesAPI from './employeesAPI';
import { RootState } from '@/app/store';

// Define the state interface
interface EmployeesState {
  employees: EmployeeDto[];
  selectedEmployee: EmployeeDto | null;
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
    serviceId?: string;
    sortBy?: string;
    sortAscending?: boolean;
  };
}

// Initial state
const initialState: EmployeesState = {
  employees: [],
  selectedEmployee: null,
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
    serviceId: undefined,
    sortBy: 'LastName',
    sortAscending: true
  }
};

// Format sort fields to match backend requirements
const getSortField = (field?: string): string | undefined => {
  if (!field) return undefined;
  
  switch (field.toLowerCase()) {
    case 'firstname': return 'FirstName';
    case 'lastname': return 'LastName';
    case 'email': return 'Email';
    case 'title': return 'Title';
    case 'createdat': return 'CreatedAt';
    default: return 'LastName';
  }
};

// Async thunks
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { pageNumber, pageSize, filters } = state.employees;
    
    const response = await EmployeesAPI.getEmployees({
      pageNumber,
      pageSize,
      searchString: filters.searchString,
      isActive: filters.isActive,
      serviceId: filters.serviceId,
      sortBy: getSortField(filters.sortBy),
      sortAscending: filters.sortAscending
    });
    
    return response;
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await EmployeesAPI.getEmployeeById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Failed to fetch employee']);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData: Omit<EmployeeDto, 'id' | 'fullName'>, { rejectWithValue }) => {
    try {
      const response = await EmployeesAPI.createEmployee(employeeData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Failed to create employee']);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, employeeData }: { id: string, employeeData: Omit<EmployeeDto, 'fullName'> }, { rejectWithValue }) => {
    try {
      const response = await EmployeesAPI.updateEmployee(id, employeeData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Failed to update employee']);
    }
  }
);

export const removeEmployee = createAsyncThunk(
  'employees/removeEmployee',
  async (id: string, { rejectWithValue }) => {
    try {
      await EmployeesAPI.deleteEmployee(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || ['Failed to delete employee']);
    }
  }
);

// Create the employees slice
const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    // Set selected employee
    setSelectedEmployee: (state, action: PayloadAction<EmployeeDto | null>) => {
      state.selectedEmployee = action.payload;
    },
    
    // Pagination actions
    setPageNumber: (state, action: PayloadAction<number>) => {
      state.pageNumber = action.payload;
    },
    
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.pageNumber = 1; // Reset to first page when changing page size
    },
    
    // Filter actions
    setSearchString: (state, action: PayloadAction<string | undefined>) => {
      state.filters.searchString = action.payload;
      state.isFiltered = Boolean(
        action.payload || 
        state.filters.isActive !== undefined ||
        state.filters.serviceId
      );
      state.pageNumber = 1; // Reset to first page when filtering
    },
    
    setIsActive: (state, action: PayloadAction<boolean | undefined>) => {
      state.filters.isActive = action.payload;
      state.isFiltered = Boolean(
        state.filters.searchString || 
        action.payload !== undefined ||
        state.filters.serviceId
      );
      state.pageNumber = 1; // Reset to first page when filtering
    },
    
    setServiceId: (state, action: PayloadAction<string | undefined>) => {
      state.filters.serviceId = action.payload;
      state.isFiltered = Boolean(
        state.filters.searchString || 
        state.filters.isActive !== undefined ||
        action.payload
      );
      state.pageNumber = 1; // Reset to first page when filtering
    },
    
    setSortBy: (state, action: PayloadAction<string>) => {
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
    // fetchEmployees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both direct PaginatedList and API response formats
        if ('items' in action.payload) {
          // Direct PaginatedList
          state.employees = action.payload.items;
          state.totalCount = action.payload.totalCount;
          state.totalPages = action.payload.totalPages;
        } else if (action.payload.data) {
          // API Response with data property
          state.employees = action.payload.data.items;
          state.totalCount = action.payload.data.totalCount;
          state.totalPages = action.payload.data.totalPages;
        }
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employees';
      })
    
    // fetchEmployeeById
    builder
      .addCase(fetchEmployeeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.selectedEmployee = action.payload;
        }
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch employee';
      })
    
    // createEmployee
    builder
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = [...state.employees, action.payload];
        state.totalCount += 1;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create employee';
      })
    
    // updateEmployee
    builder
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.map(employee => 
          employee.id === action.payload.id ? action.payload : employee
        );
        state.selectedEmployee = action.payload;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update employee';
      })
    
    // removeEmployee
    builder
      .addCase(removeEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(employee => employee.id !== action.payload);
        state.totalCount -= 1;
        if (state.selectedEmployee?.id === action.payload) {
          state.selectedEmployee = null;
        }
      })
      .addCase(removeEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete employee';
      });
  }
});

// Export actions
export const {
  setSelectedEmployee,
  setPageNumber,
  setPageSize,
  setSearchString,
  setIsActive,
  setServiceId,
  setSortBy,
  setSortDirection,
  resetFilters
} = employeesSlice.actions;

// Export selectors
export const selectEmployees = (state: RootState) => state.employees.employees;
export const selectSelectedEmployee = (state: RootState) => state.employees.selectedEmployee;
export const selectEmployeesLoading = (state: RootState) => state.employees.loading;
export const selectEmployeesError = (state: RootState) => state.employees.error;
export const selectEmployeesPageInfo = (state: RootState) => ({
  pageNumber: state.employees.pageNumber,
  pageSize: state.employees.pageSize,
  totalCount: state.employees.totalCount,
  totalPages: state.employees.totalPages
});
export const selectEmployeesFilters = (state: RootState) => state.employees.filters;
export const selectIsFiltered = (state: RootState) => state.employees.isFiltered;

export default employeesSlice.reducer; 