import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCustomers, setSearchString, setSortBy, setSortDirection, fetchCustomerById } from './customersSlice';
import { CustomerDto } from '@/types';
import { isHandling401Error } from '@/utils/axios';
import { debounce } from 'lodash';

// Import UI components
import { FiSearch, FiUser, FiPhone, FiMail, FiChevronDown, FiChevronUp, FiPlus, FiRefreshCw } from 'react-icons/fi';

interface CustomersListProps {
  onSelectCustomer: (customerId: string) => void;
  onAddCustomer?: () => void;
  isDetailViewActive?: boolean;
}

const CustomersList: React.FC<CustomersListProps> = ({ onSelectCustomer, onAddCustomer, isDetailViewActive = false }) => {
  const dispatch = useAppDispatch();
  
  // Get customers state from Redux
  const { 
    customersList, 
    loading, 
    error, 
    searchString,
    sortBy, 
    sortAscending,
    pageSize
  } = useAppSelector(state => state.customers);
  
  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [prevDetailViewActive, setPrevDetailViewActive] = useState(isDetailViewActive);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [shouldSkipFetch, setShouldSkipFetch] = useState(false);
  const [isCustomerSelectionInProgress, setIsCustomerSelectionInProgress] = useState(false);
  
  // References
  const listRef = useRef<HTMLDivElement>(null);
  const wasLoading = useRef(loading);
  const lastFetchParams = useRef({
    pageNumber: currentPage,
    pageSize: pageSize,
    searchString: searchString,
    sortBy: sortBy,
    sortAscending: sortAscending
  });
  
  // Check for token refresh
  const is401ErrorInProgress = isHandling401Error();

  // Memoize customer list to avoid unnecessary re-renders
  const safeCustomersList = useMemo(() => ({
    items: customersList?.items?.filter(Boolean) || [],
    pageNumber: customersList?.pageNumber || 1,
    totalPages: customersList?.totalPages || 0,
    totalCount: customersList?.totalCount || 0,
    hasNextPage: customersList?.hasNextPage || false,
    hasPreviousPage: customersList?.hasPreviousPage || false
  }), [customersList]);

  // Track changes in detail view mode with minimal side effects
  useEffect(() => {
    // Only update the previous state to avoid unnecessary renders
    if (prevDetailViewActive !== isDetailViewActive) {
      setPrevDetailViewActive(isDetailViewActive);
      
      // If we're closing the detail view, clear selection but don't fetch
      if (!isDetailViewActive) {
        setSelectedCustomerId(null);
        // Don't trigger a re-fetch just because detail view changed
        setShouldSkipFetch(true);
      }
    }
  }, [isDetailViewActive, prevDetailViewActive]);
  
  // Check if fetch is needed based on parameter changes
  const shouldFetchData = useCallback(() => {
    // Skip fetch if customer selection is in progress
    if (isCustomerSelectionInProgress) {
      return false;
    }

    const currentParams = {
      pageNumber: currentPage,
      pageSize: pageSize,
      searchString: searchString,
      sortBy: sortBy,
      sortAscending: sortAscending
    };

    // If we have data and params haven't changed, skip fetch
    if (
      safeCustomersList.items.length > 0 && 
      lastFetchParams.current.pageNumber === currentParams.pageNumber &&
      lastFetchParams.current.pageSize === currentParams.pageSize &&
      lastFetchParams.current.searchString === currentParams.searchString &&
      lastFetchParams.current.sortBy === currentParams.sortBy &&
      lastFetchParams.current.sortAscending === currentParams.sortAscending &&
      initialLoadComplete
    ) {
      return false;
    }

    // Update last fetch params
    lastFetchParams.current = {...currentParams};
    return true;
  }, [currentPage, pageSize, searchString, sortBy, sortAscending, safeCustomersList.items.length, initialLoadComplete, isCustomerSelectionInProgress]);
  
  // Debounced search with memoized callback
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      dispatch(setSearchString(value));
      setCurrentPage(1);
    }, 400),
    [dispatch]
  );
  
  // Refresh customer list explicitly when user requests it
  const handleRefreshList = useCallback(() => {
    setIsRefreshing(true);
    setShouldSkipFetch(false);
    
    dispatch(fetchCustomers({
      pageNumber: currentPage,
      pageSize: pageSize,
      searchString,
      sortBy,
      sortAscending,
      forceRefresh: true
    })).finally(() => {
      setIsRefreshing(false);
    });
  }, [dispatch, currentPage, searchString, sortBy, sortAscending, pageSize]);
  
  // Initial data load and pagination changes
  useEffect(() => {
    // Skip if explicitly flagged to avoid redundant fetches
    if (shouldSkipFetch || isCustomerSelectionInProgress) {
      setShouldSkipFetch(false);
      return;
    }
    
    // Don't fetch if params haven't changed and we have data
    if (!shouldFetchData() && !isRefreshing) {
      return;
    }
    
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        await dispatch(fetchCustomers({
          pageNumber: currentPage,
          pageSize: pageSize,
          searchString,
          sortBy,
          sortAscending
        }));
        setInitialLoadComplete(true);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error('Error fetching customers:', error);
        }
      }
    };

    fetchData();
    
    return () => {
      controller.abort();
    };
  }, [
    dispatch, 
    currentPage, 
    searchString, 
    sortBy, 
    sortAscending, 
    pageSize, 
    shouldFetchData, 
    isRefreshing,
    shouldSkipFetch,
    isCustomerSelectionInProgress
  ]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      dispatch(setSortDirection(!sortAscending));
    } else {
      dispatch(setSortBy(column));
      dispatch(setSortDirection(true));
    }
    setCurrentPage(1);
  };
  
  // Handle customer selection without re-fetching list
  const handleSelectCustomer = (customer: CustomerDto) => {
    // Only perform actions if selecting a different customer
    if (selectedCustomerId !== customer.id) {
      // Set flag to prevent list refresh during customer selection
      setIsCustomerSelectionInProgress(true);
      setSelectedCustomerId(customer.id);
      
      // Call the parent component's handler to fetch only this customer's details
      onSelectCustomer(customer.id);
      
      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        setIsCustomerSelectionInProgress(false);
      }, 50);
    }
  };
  
  // Render sorting indicators
  const renderSortIndicator = (column: string) => {
    if (sortBy === column) {
      return sortAscending ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />;
    }
    return null;
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Scroll to top when loading changes from true to false
  useEffect(() => {
    if (wasLoading.current && !loading && listRef.current) {
      listRef.current.scrollTop = 0;
    }
    wasLoading.current = loading;
  }, [loading]);
  
  // Component mount logic - fetch only if needed
  useEffect(() => {
    if (!initialLoadComplete && safeCustomersList.items.length === 0) {
      setInitialLoadComplete(true);
      
      // Only fetch on mount if we have no data
      if (safeCustomersList.items.length === 0) {
        dispatch(fetchCustomers({
          pageNumber: 1,
          pageSize: pageSize,
          searchString,
          sortBy,
          sortAscending
        }));
      }
    }
    
    return () => {
      // Clear selection when component unmounts
      setSelectedCustomerId(null);
    };
  }, []); // Empty dependency array means this runs on mount
  
  return (
    <div className="bg-white shadow rounded-lg flex flex-col h-full overflow-hidden">
      {/* Header with search and add button */}
      <div className="p-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchString}
            onChange={handleSearchChange}
            placeholder="Müşteri ara..."
            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={onAddCustomer}
            className="inline-flex hover:cursor-pointer items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold duration-300 text-white bg-red-600 hover:bg-red-900"
          >
            <FiPlus className="mr-1 h-5 w-5" />
            Müşteri Ekle
          </button>
        </div>
      </div>
      
      {/* Sort controls */}
      <div className="px-4 py-2 border-b flex flex-wrap items-center gap-2 text-xs text-gray-600">
        <span>Sıralama:</span>
        <button 
          onClick={() => handleSortChange('FullName')}
          className={`px-2 py-1 rounded-full border ${sortBy === 'FullName' ? 'bg-primary-100 border-primary-300' : 'bg-gray-50 border-gray-300'}`}
        >
          İsim {renderSortIndicator('FullName')}
        </button>
        <button 
          onClick={() => handleSortChange('Email')}
          className={`px-2 py-1 rounded-full border ${sortBy === 'Email' ? 'bg-primary-100 border-primary-300' : 'bg-gray-50 border-gray-300'}`}
        >
          E-posta {renderSortIndicator('Email')}
        </button>
      </div>
      
      {/* Customer list - responsive yapı */}
      <div 
        ref={listRef}
        className="flex-grow overflow-y-auto p-3 customers-list-container"
        style={{
          maxHeight: isDetailViewActive ? 'calc(100vh - 300px)' : 'unset', 
          height: isDetailViewActive ? 'auto' : '100%'
        }}
      >
        {(loading && !isRefreshing && (!safeCustomersList.items || safeCustomersList.items.length === 0)) || is401ErrorInProgress ? (
          <div className="p-6">
            <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Subtle loading indicator at the top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden">
                <div className="h-full bg-primary-600 animate-pulse" style={{ width: '40%' }}></div>
              </div>
              
              {/* Skeleton UI for customers */}
              <div className="grid gap-4 p-4 animate-pulse grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="bg-white border rounded-lg p-5">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="min-w-0 flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="h-4 w-4 bg-gray-200 rounded-full mr-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                          <div className="flex items-center">
                            <div className="h-4 w-4 bg-gray-200 rounded-full mr-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (error && !is401ErrorInProgress) ? (
          <div className="p-4 text-center">
            <div className="rounded-md bg-red-50 p-3 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Müşteri listesi yüklenirken hata oluştu</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleRefreshList}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-900 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FiRefreshCw className="mr-1 h-4 w-4" />
              Tekrar Dene
            </button>
          </div>
        ) : (!safeCustomersList.items || safeCustomersList.items.length === 0) ? (
          <div className="p-6 text-center text-gray-500">
            <FiUser className="mx-auto h-10 w-10 mb-3 text-gray-400" />
            <h3 className="text-base font-medium text-gray-900 mb-1">Müşteri bulunamadı</h3>
            <p className="text-xs">Arama kriterlerini değiştirebilir veya yeni bir müşteri ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${
            isDetailViewActive 
              ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {safeCustomersList.items
              .filter((customer: CustomerDto | undefined | null) => customer !== undefined && customer !== null)
              .map((customer: CustomerDto) => {
                // Normalize customer data
                const customerAny = customer as any;
                const displayName = customer.fullName || 
                  customerAny.FullName || 
                  `${customer.firstName || customerAny.FirstName || ''} ${customer.lastName || customerAny.LastName || ''}`;
                const displayEmail = customer.email || customerAny.Email || '';
                const displayPhone = customer.phoneNumber || customerAny.PhoneNumber || 'Yok';
                
                return (
                  <div 
                    key={customer.id} 
                    className={`bg-white border rounded-lg shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md ${
                      selectedCustomerId === customer.id ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:border-primary-200'
                    } p-5`}
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiUser className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {displayName}
                        </h3>
                        <div className="mt-2 flex flex-col space-y-2">
                          <div className="flex items-center">
                            <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700 truncate">{displayEmail || 'E-posta yok'}</span>
                          </div>
                          <div className="flex items-center">
                            <FiPhone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700">{displayPhone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
        
        {/* Loading indicator for refresh */}
        {isRefreshing && (
          <div className="sticky bottom-0 py-2 bg-white bg-opacity-90 flex justify-center items-center mt-3 rounded">
            <div className="w-full max-w-md h-1 bg-gray-200 rounded-full overflow-hidden mx-2">
              <div className="h-full bg-primary-600 animate-pulse" style={{ width: '40%' }}></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {safeCustomersList.totalPages > 1 && (
        <div className="bg-white px-3 py-2 flex items-center justify-between border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="hidden sm:block">
              <p className="text-xs text-gray-700">
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -&nbsp;
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, safeCustomersList.totalCount || 0)}
                </span>&nbsp;
                / <span className="font-medium">{safeCustomersList.totalCount || 0}</span>
              </p>
            </div>
            <div className="flex justify-center sm:justify-end mt-2 sm:mt-0">
              <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!safeCustomersList.hasPreviousPage}
                  className={`relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 text-xs ${
                    safeCustomersList.hasPreviousPage 
                      ? 'text-gray-500 bg-white hover:bg-gray-50' 
                      : 'text-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <span className="sr-only">Önceki</span>
                  <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: safeCustomersList.totalPages || 0 }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and one page around current page
                    return (
                      page === 1 || 
                      page === (safeCustomersList.totalPages || 0) || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there are gaps
                    const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                    const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && (
                          <span className="relative inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-xs text-gray-700">
                            ...
                          </span>
                        )}
                        
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-3 py-1 border ${
                            currentPage === page
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-xs`}
                        >
                          {page}
                        </button>
                        
                        {showEllipsisAfter && (
                          <span className="relative inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-xs text-gray-700">
                            ...
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })
                }
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!safeCustomersList.hasNextPage}
                  className={`relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 text-xs ${
                    safeCustomersList.hasNextPage 
                      ? 'text-gray-500 bg-white hover:bg-gray-50' 
                      : 'text-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <span className="sr-only">Sonraki</span>
                  <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList; 