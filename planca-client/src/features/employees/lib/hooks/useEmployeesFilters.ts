import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';

interface UseEmployeesFiltersParams {
  defaultPageSize?: number;
  defaultSortBy?: string;
  defaultSortAscending?: boolean;
  debounceMs?: number;
}

interface EmployeeFilters {
  pageNumber: number;
  pageSize: number;
  searchString: string;
  isActive?: boolean;
  sortBy: string;
  sortAscending: boolean;
}

export const useEmployeesFilters = ({
  defaultPageSize = 6,
  defaultSortBy = 'lastName',
  defaultSortAscending = true,
  debounceMs = 300
}: UseEmployeesFiltersParams = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<EmployeeFilters>(() => ({
    pageNumber: parseInt(searchParams.get('page') || '1'),
    pageSize: parseInt(searchParams.get('size') || defaultPageSize.toString()),
    searchString: searchParams.get('search') || '',
    isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
    sortBy: searchParams.get('sortBy') || defaultSortBy,
    sortAscending: searchParams.get('sortAsc') !== 'false'
  }));

  // Update URL params when filters change
  const updateUrlParams = useCallback((newFilters: Partial<EmployeeFilters>) => {
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
      params.set('isActive', updatedFilters.isActive.toString());
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

  return {
    filters,
    setPage,
    setPageSize,
    setSearchString,
    setIsActive,
    setSortBy,
    setSortDirection,
    handleSortChange,
    clearFilters,
    nextPage,
    prevPage,
    
    // Convenience getters
    hasSearch: Boolean(filters.searchString),
    hasActiveFilter: filters.isActive !== undefined,
    isFirstPage: filters.pageNumber === 1,
    
    // For RTK Query
    queryParams: {
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
      searchString: filters.searchString || undefined,
      isActive: filters.isActive,
      sortBy: filters.sortBy,
      sortAscending: filters.sortAscending
    }
  };
};

export default useEmployeesFilters; 