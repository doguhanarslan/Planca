import { baseApi } from '@/shared/api/base/baseApi';
import { CustomerDto, PaginatedList } from '@/shared/types';

// API request types
interface GetCustomersParams {
  pageNumber?: number;
  pageSize?: number;
  searchString?: string;
  sortBy?: string;
  sortAscending?: boolean;
}

interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  notes?: string;
}

interface UpdateCustomerRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  notes?: string;
}

// Transform request data to API format (PascalCase)
const transformCreateCustomerRequest = (data: CreateCustomerRequest) => ({
  FirstName: data.firstName,
  LastName: data.lastName,
  Email: data.email,
  PhoneNumber: data.phoneNumber || '',
  Notes: data.notes || ''
});

const transformUpdateCustomerRequest = (data: UpdateCustomerRequest) => ({
  Id: data.id,
  FirstName: data.firstName,
  LastName: data.lastName,
  Email: data.email,
  PhoneNumber: data.phoneNumber || '',
  Notes: data.notes || ''
});

// Normalize customer data from API response
const normalizeCustomerData = (customer: any): CustomerDto => {
  if (!customer) return customer;
  
  return {
    id: customer.id || customer.Id || '',
    userId: customer.userId || customer.UserId || null,
    firstName: customer.firstName || customer.FirstName || '',
    lastName: customer.lastName || customer.LastName || '',
    fullName: customer.fullName || customer.FullName || 
             `${customer.firstName || customer.FirstName || ''} ${customer.lastName || customer.LastName || ''}`.trim(),
    email: customer.email || customer.Email || '',
    phoneNumber: customer.phoneNumber || customer.PhoneNumber || '',
    notes: customer.notes || customer.Notes || '',
    tenantId: customer.tenantId || customer.TenantId || null
  };
};

// Valid sort values mapping
const VALID_SORT_VALUES: Record<string, string> = {
  'firstName': 'FirstName',
  'lastname': 'LastName',
  'LastName': 'LastName',
  'email': 'Email',
  'createdAt': 'CreatedAt',
  'name': 'LastName',
  'fullName': 'LastName'
};

const transformSortBy = (sortBy?: string): string => {
  if (!sortBy) return 'LastName';
  return VALID_SORT_VALUES[sortBy] || 'LastName';
};

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get paginated customers list
    getCustomers: builder.query<PaginatedList<CustomerDto>, GetCustomersParams>({
      query: (params = {}) => {
        const queryParams: Record<string, string | number | boolean> = {
          PageNumber: params.pageNumber || 1,
          PageSize: params.pageSize || 10,
          SortBy: transformSortBy(params.sortBy),
          SortAscending: params.sortAscending !== false,
          _t: Date.now() // Cache busting
        };

        // Only add search parameter if it has a value
        if (params.searchString && params.searchString.trim()) {
          queryParams.SearchString = params.searchString.trim();
        }

        return {
          url: '/Customers',
          params: queryParams
        };
      },
      transformResponse: (response: any): PaginatedList<CustomerDto> => {
        console.log('Customers API Raw Response:', response);
        
        // Backend'den gelen response format kontrolü
        let actualData = response;
        
        // Eğer response ApiResponse<T> formatındaysa
        if (response?.data && typeof response.data === 'object') {
          actualData = response.data;
        }
        
        // Backend BaseApiController.HandlePagedResult plain object döndürüyor
        if (actualData && actualData.items && Array.isArray(actualData.items)) {
          return {
            items: actualData.items.map(normalizeCustomerData).filter(Boolean),
            pageNumber: actualData.pageNumber || 1,
            totalPages: actualData.totalPages || 0,
            totalCount: actualData.totalCount || 0,
            hasNextPage: actualData.hasNextPage || false,
            hasPreviousPage: actualData.hasPreviousPage || false
          };
        }
        
        // Fallback için boş liste döndür
        console.warn('Unexpected customers response format:', response);
        return {
          items: [],
          pageNumber: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false
        };
      },
      providesTags: (result) => [
        { type: 'Customer', id: 'LIST' },
        ...(result?.items || []).map(customer => ({ type: 'Customer' as const, id: customer.id }))
      ],
    }),

    // Get single customer by ID
    getCustomerById: builder.query<CustomerDto, string>({
      query: (id) => ({
        url: `/Customers/${id}`,
        params: { _t: Date.now() }
      }),
      transformResponse: (response: any): CustomerDto => normalizeCustomerData(response),
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),

    // Create new customer
    createCustomer: builder.mutation<CustomerDto, CreateCustomerRequest>({
      query: (customerData) => ({
        url: '/Customers',
        method: 'POST',
        body: transformCreateCustomerRequest(customerData),
      }),
      transformResponse: (response: any): CustomerDto => normalizeCustomerData(response),
      invalidatesTags: [
        { type: 'Customer', id: 'LIST' }
      ],
    }),

    // Update existing customer
    updateCustomer: builder.mutation<CustomerDto, UpdateCustomerRequest>({
      query: ({ id, ...customerData }) => ({
        url: `/Customers/${id}`,
        method: 'PUT',
        body: transformUpdateCustomerRequest({ id, ...customerData }),
      }),
      transformResponse: (response: any): CustomerDto => normalizeCustomerData(response),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' }
      ],
    }),

    // Delete customer
    deleteCustomer: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `/Customers/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: any, meta) => {
        return meta?.response?.status === 200 || meta?.response?.status === 204;
      },
      invalidatesTags: (result, error, id) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' }
      ],
      // Optimistic update for immediate UI feedback
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // Optimistically remove the customer from cache
        const patchResult = dispatch(
          customersApi.util.updateQueryData('getCustomers', {}, (draft) => {
            if (draft.items) {
              draft.items = draft.items.filter(item => item.id !== id);
              draft.totalCount = Math.max(0, (draft.totalCount || 0) - 1);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert the optimistic update on error
          patchResult.undo();
        }
      },
    }),
  }),
});

// Export hooks
export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;

export default customersApi; 