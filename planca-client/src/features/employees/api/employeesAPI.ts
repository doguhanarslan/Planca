import { baseApi } from '@/shared/api/base/baseApi';
import { ApiResponse, PaginatedList, EmployeeDto } from '@/shared/types';

// Valid SortBy values for Employees API (based on debug info)
const VALID_EMPLOYEE_SORT_VALUES = {
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
  // Default fallback
  'name': 'FirstName', // Map invalid 'name' to valid 'FirstName'
  'Name': 'FirstName',
} as const;

// Transform query params to API format
const transformParams = (params: {
  pageNumber?: number;
  pageSize?: number;
  searchString?: string;
  isActive?: boolean;
  sortBy?: string;
  sortAscending?: boolean;
  tenantId?: string;
}) => {
  // Get valid SortBy value or use default
  const getSortBy = (sortBy?: string): string => {
    if (!sortBy) return 'FirstName';
    
    // Check if the sortBy value is valid
    const validValue = VALID_EMPLOYEE_SORT_VALUES[sortBy as keyof typeof VALID_EMPLOYEE_SORT_VALUES];
    if (validValue) {
      return validValue;
    }
    
    // Default fallback
    console.warn(`Invalid SortBy value for employees: ${sortBy}. Using FirstName instead.`);
    return 'FirstName';
  };

  const apiParams: Record<string, any> = {
    PageNumber: params.pageNumber || 1,
    PageSize: params.pageSize || 10,
    SortBy: getSortBy(params.sortBy),
    SortAscending: params.sortAscending ?? true,
  };

  if (params.searchString?.trim()) {
    apiParams.SearchString = params.searchString.trim();
  }
  
  if (params.isActive !== undefined) {
    apiParams.IsActive = params.isActive;
  }
  
  console.log('Employees API params:', apiParams);
  return apiParams;
};

// Transform employee data for API
const transformEmployeeForApi = (employee: Omit<EmployeeDto, 'id'> | EmployeeDto) => ({
  Id: 'id' in employee ? employee.id : undefined,
  UserId: employee.userId,
  FirstName: employee.firstName,
  LastName: employee.lastName,
  Email: employee.email,
  PhoneNumber: employee.phoneNumber,
  Title: employee.title,
  IsActive: employee.isActive,
  ServiceIds: employee.serviceIds,
  WorkingHours: employee.workingHours?.map(wh => ({
    DayOfWeek: wh.dayOfWeek,
    StartTime: wh.startTime,
    EndTime: wh.endTime,
    IsWorkingDay: wh.isWorkingDay,
  })),
  TenantId: employee.tenantId,
});

export const employeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get paginated employees list
    getEmployees: builder.query<
      PaginatedList<EmployeeDto>, 
      {
        pageNumber?: number;
        pageSize?: number;
        searchString?: string;
        isActive?: boolean;
        sortBy?: string;
        sortAscending?: boolean;
      }
    >({
      query: (params = {}) => ({
        url: '/Employees',
        params: transformParams(params),
      }),
      transformResponse: (response: any) => {
        console.log('RTK Query Employees Response:', response);
        
        // Handle different response formats
        if (response?.data?.items) {
          // ApiResponse<PaginatedList> format
          return response.data;
        } else if (response?.items) {
          // Direct PaginatedList format
          return response;
        } else {
          // Fallback
          return {
            items: [],
            pageNumber: 1,
            totalPages: 0,
            totalCount: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          };
        }
      },
      providesTags: (result, error, arg) => [
        'Employee',
        { type: 'Employee', id: 'LIST' }, // Add list-specific tag
        // Add individual tags for each employee for more granular invalidation
        ...(result?.items?.map(({ id }) => ({ type: 'Employee' as const, id })) || []),
      ],
    }),

    // Get single employee by ID
    getEmployeeById: builder.query<EmployeeDto, string>({
      query: (id) => ({
        url: `/Employees/${id}`,
      }),
      transformResponse: (response: ApiResponse<EmployeeDto>) => {
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
    }),

    // Create new employee
    createEmployee: builder.mutation<EmployeeDto, Omit<EmployeeDto, 'id'>>({
      query: (employeeData) => ({
        url: '/Employees',
        method: 'POST',
        body: transformEmployeeForApi(employeeData),
      }),
      transformResponse: (response: any) => {
        console.log('Create Employee Response:', response);
        
        // Handle different response formats
        if (response?.data) {
          return response.data;
        } else if (response?.id) {
          return response;
        } else {
          throw new Error('Invalid response format');
        }
      },
      invalidatesTags: (result, error, arg) => {
        console.log('🔄 Invalidating Employee cache after creation:', { result, error });
        return [
          'Employee', // Invalidate all employees to refresh the list
          { type: 'Employee', id: 'LIST' }, // Invalidate list-specific cache
        ];
      },
    }),

    // Update existing employee
    updateEmployee: builder.mutation<EmployeeDto, EmployeeDto>({
      query: (employeeData) => ({
        url: `/Employees/${employeeData.id}`,
        method: 'PUT',
        body: transformEmployeeForApi(employeeData),
      }),
      transformResponse: (response: any) => {
        console.log('Update Employee Response:', response);
        
        if (response?.data) {
          return response.data;
        } else if (response?.id) {
          return response;
        } else {
          // If API doesn't return the updated employee, return the input data
          return response;
        }
      },
      invalidatesTags: (result, error, { id }) => [
        'Employee', // Invalidate all employees
        { type: 'Employee', id }, // Invalidate specific employee
      ],
    }),

    // Delete employee
    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: `/Employees/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        'Employee', // Invalidate all employees
        { type: 'Employee', id }, // Invalidate specific employee
      ],
    }),

    // Get active employees for dropdown/select (simplified, active only)
    getActiveEmployees: builder.query<EmployeeDto[], void>({
      query: () => ({
        url: '/Employees',
        params: {
          IsActive: true,
          PageSize: 100,
          SortBy: 'FirstName', // Use valid value directly
          SortAscending: true,
        },
      }),
      transformResponse: (response: any) => {
        console.log('getActiveEmployees response:', response);
        if (response?.data?.items) {
          return response.data.items;
        } else if (response?.items) {
          return response.items;
        } else {
          return [];
        }
      },
      providesTags: ['Employee'],
    }),

    // Update employee working hours
    updateEmployeeWorkingHours: builder.mutation<
      EmployeeDto,
      { id: string; workingHours: EmployeeDto['workingHours'] }
    >({
      query: ({ id, workingHours }) => ({
        url: `/Employees/${id}/working-hours`,
        method: 'PUT',
        body: {
          WorkingHours: workingHours?.map(wh => ({
            DayOfWeek: wh.dayOfWeek,
            StartTime: wh.startTime,
            EndTime: wh.endTime,
            IsWorkingDay: wh.isWorkingDay,
          })),
        },
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        } else if (response?.id) {
          return response;
        } else {
          return response;
        }
      },
      invalidatesTags: (result, error, { id }) => [
        'Employee',
        { type: 'Employee', id },
      ],
    }),

    // Update employee services
    updateEmployeeServices: builder.mutation<
      EmployeeDto,
      { id: string; serviceIds: string[] }
    >({
      query: ({ id, serviceIds }) => ({
        url: `/Employees/${id}/services`,
        method: 'PUT',
        body: { ServiceIds: serviceIds },
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        } else if (response?.id) {
          return response;
        } else {
          return response;
        }
      },
      invalidatesTags: (result, error, { id }) => [
        'Employee',
        { type: 'Employee', id },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetActiveEmployeesQuery,
  useUpdateEmployeeWorkingHoursMutation,
  useUpdateEmployeeServicesMutation,
  useLazyGetEmployeesQuery,
  useLazyGetEmployeeByIdQuery,
} = employeesApi;

// Export endpoints for use in other places
export const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getActiveEmployees,
  updateEmployeeWorkingHours,
  updateEmployeeServices,
} = employeesApi.endpoints;