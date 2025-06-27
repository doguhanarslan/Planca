import { baseApi } from '@/shared/api/base/baseApi';
import { ApiResponse, PaginatedList, ServiceDto } from '@/shared/types';

// Transform query params to API format
const transformParams = (params: {
  pageNumber?: number;
  pageSize?: number;
  searchString?: string;
  isActive?: boolean;
  maxPrice?: number;
  sortBy?: string;
  sortAscending?: boolean;
  tenantId?: string;
}) => {
  const apiParams: Record<string, any> = {
    PageNumber: params.pageNumber || 1,
    PageSize: params.pageSize || 10,
    SortBy: params.sortBy ? params.sortBy.charAt(0).toUpperCase() + params.sortBy.slice(1) : 'Name',
    SortAscending: params.sortAscending ?? true,
    _t: Date.now(), // Cache busting
  };

  if (params.searchString?.trim()) {
    apiParams.SearchString = params.searchString.trim();
  }
  
  if (params.isActive !== undefined) {
    apiParams.IsActive = params.isActive;
  }
  
  if (params.maxPrice !== undefined) {
    apiParams.MaxPrice = params.maxPrice;
  }
  
  return apiParams;
};

// Transform service data for API
const transformServiceForApi = (service: Omit<ServiceDto, 'id'> | ServiceDto) => ({
  Id: 'id' in service ? service.id : undefined,
  Name: service.name,
  Description: service.description,
  Color: service.color,
  Price: service.price,
  DurationMinutes: service.durationMinutes,
  IsActive: service.isActive,
  TenantId: service.tenantId,
});

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get paginated services list
    getServices: builder.query<
      PaginatedList<ServiceDto>, 
      {
        pageNumber?: number;
        pageSize?: number;
        searchString?: string;
        isActive?: boolean;
        maxPrice?: number;
        sortBy?: string;
        sortAscending?: boolean;
      }
    >({
      query: (params = {}) => ({
        url: '/Services',
        params: transformParams(params),
      }),
      transformResponse: (response: any) => {
        console.log('RTK Query Services Response:', response);
        
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
        'Service',
        { type: 'Service', id: 'LIST' },
        // Add individual tags for each service for more granular invalidation
        ...(result?.items?.map(({ id }) => ({ type: 'Service' as const, id })) || []),
      ],
    }),

    // Get single service by ID
    getServiceById: builder.query<ServiceDto, string>({
      query: (id) => ({
        url: `/Services/${id}`,
      }),
      transformResponse: (response: ApiResponse<ServiceDto>) => {
        return response.data;
      },
      providesTags: (result, error, id) => [{ type: 'Service', id }],
    }),

    // Create new service
    createService: builder.mutation<ServiceDto, Omit<ServiceDto, 'id'>>({
      query: (serviceData) => ({
        url: '/Services',
        method: 'POST',
        body: transformServiceForApi(serviceData),
      }),
      transformResponse: (response: any) => {
        console.log('Create Service Response:', response);
        
        // Handle different response formats
        if (response?.data) {
          return response.data;
        } else if (response?.id) {
          return response;
        } else {
          throw new Error('Invalid response format');
        }
      },
      invalidatesTags: [
        'Service',
        { type: 'Service', id: 'LIST' },
      ],
      // Optimistic update for immediate UI feedback
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: newService } = await queryFulfilled;
          
          // Update the services list cache with the new service
          dispatch(
            servicesApi.util.updateQueryData('getServices', {}, (draft) => {
              if (draft.items) {
                draft.items.unshift(newService);
                draft.totalCount = (draft.totalCount || 0) + 1;
              }
            })
          );
        } catch {
          // If the request fails, RTK Query will automatically revert optimistic updates
        }
      },
    }),

    // Update existing service
    updateService: builder.mutation<ServiceDto, ServiceDto>({
      query: (serviceData) => ({
        url: `/Services/${serviceData.id}`,
        method: 'PUT',
        body: transformServiceForApi(serviceData),
      }),
      transformResponse: (response: any) => {
        console.log('Update Service Response:', response);
        
        if (response?.data) {
          return response.data;
        } else if (response?.id) {
          return response;
        } else {
          // If API doesn't return the updated service, return the input data
          return response;
        }
      },
      invalidatesTags: (result, error, { id }) => [
        'Service',
        { type: 'Service', id: 'LIST' },
        { type: 'Service', id },
      ],
      // Optimistic update
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Optimistically update the service in all relevant caches
        const patchResult = dispatch(
          servicesApi.util.updateQueryData('getServices', {}, (draft) => {
            const service = draft.items?.find(item => item.id === arg.id);
            if (service) {
              Object.assign(service, arg);
            }
          })
        );

        const patchSingleResult = dispatch(
          servicesApi.util.updateQueryData('getServiceById', arg.id, (draft) => {
            Object.assign(draft, arg);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic updates on error
          patchResult.undo();
          patchSingleResult.undo();
        }
      },
    }),

    // Delete service
    deleteService: builder.mutation<void, string>({
      query: (id) => ({
        url: `/Services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        'Service',
        { type: 'Service', id: 'LIST' },
        { type: 'Service', id },
      ],
      // Optimistic update for immediate UI feedback
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // Optimistically remove the service from all caches
        const patchResult = dispatch(
          servicesApi.util.updateQueryData('getServices', {}, (draft) => {
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

    // Get services for dropdown/select (simplified, active only)
    getActiveServices: builder.query<ServiceDto[], void>({
      query: () => ({
        url: '/Services',
        params: {
          IsActive: true,
          PageSize: 100, // Get all active services
          SortBy: 'Name',
          SortAscending: true,
        },
      }),
      transformResponse: (response: any) => {
        if (response?.data?.items) {
          return response.data.items;
        } else if (response?.items) {
          return response.items;
        } else {
          return [];
        }
      },
      providesTags: ['Service', { type: 'Service', id: 'ACTIVE_LIST' }],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetActiveServicesQuery,
  useLazyGetServicesQuery,
  useLazyGetServiceByIdQuery,
} = servicesApi;

// Export endpoints for use in other places
export const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getActiveServices,
} = servicesApi.endpoints;