import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';

interface UseServicesFiltersParams {
  defaultPageSize?: number;
  defaultSortBy?: string;
  defaultSortAscending?: boolean;
  debounceMs?: number;
}

interface ServiceFilters {
  pageNumber: number;
  pageSize: number;
  searchString: string;
  isActive?: boolean;
  maxPrice?: number;
  sortBy: string;
  sortAscending: boolean;
}

export const useServicesFilters = ({
  defaultPageSize = 10,
  defaultSortBy = 'name',
  defaultSortAscending = true,
  debounceMs = 300
}: UseServicesFiltersParams = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<ServiceFilters>(() => ({
    pageNumber: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('size') || defaultPageSize.toString()),
    searchString: searchParams.get('search') || '',
    isActive: searchParams.get('active') ? searchParams.get('active') === 'true' : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    sortBy: searchParams.get('sortBy') || defaultSortBy,
    sortAscending: searchParams.get('sortAsc') !== 'false'
  }));

  // Update URL params when filters change
  const updateUrlParams = useCallback((newFilters: Partial<ServiceFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    const params = new URLSearchParams();
    
    if (updatedFilters.pageNumber > 1) {
      params.set('page', updatedFilters.pageNumber.toString());
    }
    if (updatedFilters.pageSize !== defaultPageSize) {
      params.set('size', updatedFilters.pageSize.toString());
    }
    if (updatedFilters.searchString) {
      params.set('search', updatedFilters.searchString);
    }
    if (updatedFilters.isActive !== undefined) {
      params.set('active', updatedFilters.isActive.toString());
    }
    if (updatedFilters.maxPrice !== undefined) {
      params.set('maxPrice', updatedFilters.maxPrice.toString());
    }
    if (updatedFilters.sortBy !== defaultSortBy) {
      params.set('sortBy', updatedFilters.sortBy);
    }
    if (!updatedFilters.sortAscending) {
      params.set('sortAsc', 'false');
    }

    setSearchParams(params);
    setFilters(updatedFilters);
  }, [filters, setSearchParams, defaultPageSize, defaultSortBy]);

  // Debounced search update
  const debouncedSearchUpdate = useMemo(
    () => debounce((searchString: string) => {
      updateUrlParams({ searchString, pageNumber: 1 });
    }, debounceMs),
    [updateUrlParams, debounceMs]
  );

  // Debounced price filter update
  const debouncedPriceUpdate = useMemo(
    () => debounce((maxPrice: number | undefined) => {
      updateUrlParams({ maxPrice, pageNumber: 1 });
    }, debounceMs),
    [updateUrlParams, debounceMs]
  );

  // Filter update functions
  const setPage = useCallback((pageNumber: number) => {
    updateUrlParams({ pageNumber });
  }, [updateUrlParams]);

  const setPageSize = useCallback((pageSize: number) => {
    updateUrlParams({ pageSize, pageNumber: 1 });
  }, [updateUrlParams]);

  const setSearchString = useCallback((searchString: string) => {
    debouncedSearchUpdate(searchString);
  }, [debouncedSearchUpdate]);

  const setIsActive = useCallback((isActive: boolean | undefined) => {
    updateUrlParams({ isActive, pageNumber: 1 });
  }, [updateUrlParams]);

  const setMaxPrice = useCallback((maxPrice: number | undefined) => {
    debouncedPriceUpdate(maxPrice);
  }, [debouncedPriceUpdate]);

  const setSortBy = useCallback((sortBy: string) => {
    updateUrlParams({ sortBy, pageNumber: 1 });
  }, [updateUrlParams]);

  const setSortDirection = useCallback((sortAscending: boolean) => {
    updateUrlParams({ sortAscending, pageNumber: 1 });
  }, [updateUrlParams]);

  const handleSortChange = useCallback((field: string) => {
    const newSortAscending = filters.sortBy === field ? !filters.sortAscending : true;
    updateUrlParams({ 
      sortBy: field, 
      sortAscending: newSortAscending, 
      pageNumber: 1 
    });
  }, [filters.sortBy, filters.sortAscending, updateUrlParams]);

  const clearFilters = useCallback(() => {
    updateUrlParams({
      pageNumber: 1,
      pageSize: defaultPageSize,
      searchString: '',
      isActive: undefined,
      maxPrice: undefined,
      sortBy: defaultSortBy,
      sortAscending: defaultSortAscending
    });
  }, [updateUrlParams, defaultPageSize, defaultSortBy, defaultSortAscending]);

  const nextPage = useCallback(() => {
    setPage(filters.pageNumber + 1);
  }, [filters.pageNumber, setPage]);

  const prevPage = useCallback(() => {
    if (filters.pageNumber > 1) {
      setPage(filters.pageNumber - 1);
    }
  }, [filters.pageNumber, setPage]);

  // Check if any filters are applied
  const hasFilters = useMemo(() => {
    return Boolean(
      filters.searchString ||
      filters.isActive !== undefined ||
      filters.maxPrice !== undefined ||
      filters.sortBy !== defaultSortBy ||
      filters.sortAscending !== defaultSortAscending
    );
  }, [filters, defaultSortBy, defaultSortAscending]);

  return {
    filters,
    setPage,
    setPageSize,
    setSearchString,
    setIsActive,
    setMaxPrice,
    setSortBy,
    setSortDirection,
    handleSortChange,
    clearFilters,
    nextPage,
    prevPage,
    
    // Convenience getters
    hasSearch: Boolean(filters.searchString),
    hasFilters,
    isFirstPage: filters.pageNumber === 1,
    
    // For RTK Query
    queryParams: {
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      searchString: filters.searchString || undefined,
      isActive: filters.isActive,
      maxPrice: filters.maxPrice,
      sortBy: filters.sortBy,
      sortAscending: filters.sortAscending
    }
  };
};

export default useServicesFilters; 