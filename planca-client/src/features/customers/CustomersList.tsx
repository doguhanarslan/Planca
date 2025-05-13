import React, { useEffect, useState, useCallback } from 'react';
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
  isDetailViewActive?: boolean; // Detay görünümü ve liste görünümünün aynı anda görüntülenmesi için kullanılır
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
  
  // Local state for current page and refreshing state
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Add a check for token refresh to avoid showing 401 errors during token refresh
  const is401ErrorInProgress = isHandling401Error();
  
  // Arama metni için depolanmış arama
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      dispatch(setSearchString(value));
      setCurrentPage(1);
    }, 500),
    [dispatch]
  );
  
  // Müşteri listesini yenileme fonksiyonu 
  const handleRefreshList = useCallback(() => {
    setIsRefreshing(true);
    
    dispatch(fetchCustomers({
      pageNumber: currentPage,
      pageSize,
      searchString,
      sortBy,
      sortAscending,
      forceRefresh: true
    })).finally(() => {
      setIsRefreshing(false);
    });
  }, [dispatch, currentPage, pageSize, searchString, sortBy, sortAscending]);
  
  // Load customers on component mount and when search/sort/page changes
  useEffect(() => {
    // Local değişkenleri saklayarak yeni useEffect çalıştırması sırasında 
    // hala var olup olmadıklarını kontrol ediyoruz
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        await dispatch(fetchCustomers({
          pageNumber: currentPage,
          pageSize,
          searchString,
          sortBy,
          sortAscending
        }));
      } catch (error) {
        // İptal edilen istekler için hata gösterme
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error('Error fetching customers:', error);
        }
      }
    };

    fetchData();
    
    // Cleanup fonksiyonu - bileşen unmount olduğunda veya dependency'ler değiştiğinde çalışır
    return () => {
      controller.abort();
    };
  }, [dispatch, currentPage, pageSize, searchString, sortBy, sortAscending]);
  
  // Enhanced debugging
  useEffect(() => {
    if (customersList?.items?.length > 0) {
      console.log('First customer object structure:', JSON.stringify(customersList.items[0], null, 2));
    }
  }, [customersList]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      // Toggle direction if same column
      dispatch(setSortDirection(!sortAscending));
    } else {
      // Set new column and default to ascending
      dispatch(setSortBy(column));
      dispatch(setSortDirection(true));
    }
    setCurrentPage(1); // Reset to first page on sort change
  };
  
  // Handle customer selection
  const handleSelectCustomer = (customer: CustomerDto) => {
    dispatch(fetchCustomerById(customer.id));
    onSelectCustomer(customer.id);
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
    setCurrentPage(page);
  };
  
  // Ensure customersList is initialized with default values if undefined
  const safeCustomersList = {
    items: customersList?.items?.filter(Boolean) || [],
    pageNumber: customersList?.pageNumber || 1,
    totalPages: customersList?.totalPages || 0,
    totalCount: customersList?.totalCount || 0,
    hasNextPage: customersList?.hasNextPage || false,
    hasPreviousPage: customersList?.hasPreviousPage || false
  };
  
  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with search and add button */}
      <div className="p-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchString}
            onChange={handleSearchChange}
            placeholder="Müşteri ara..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleRefreshList}
            disabled={isRefreshing || loading}
            className={`inline-flex items-center hover:cursor-pointer px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
              isRefreshing || loading 
                ? 'text-gray-400 bg-gray-100' 
                : 'text-gray-700 bg-white hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
          >
            <FiRefreshCw className={`mr-2 -ml-1 h-4 w-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
          <button
            onClick={onAddCustomer}
            className="inline-flex hover:cursor-pointer items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiPlus className="mr-2 -ml-1 h-5 w-5" />
            Müşteri Ekle
          </button>
        </div>
      </div>
      
      {/* Customer list */}
      <div className="p-4">
        {(loading || is401ErrorInProgress) && (!safeCustomersList.items || safeCustomersList.items.length === 0) ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
            {is401ErrorInProgress ? (
              <span className="ml-3 text-sm text-gray-600">Oturum yenileniyor...</span>
            ) : (
              <span className="ml-3 text-sm text-gray-600">Müşteriler yükleniyor...</span>
            )}
          </div>
        ) : (error && !is401ErrorInProgress) ? (
          <div className="p-6 text-center">
            <div className="rounded-md bg-red-50 p-4 mb-4">
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiRefreshCw className="mr-2 -ml-1 h-5 w-5" />
              Tekrar Dene
            </button>
          </div>
        ) : (!safeCustomersList.items || safeCustomersList.items.length === 0) ? (
          <div className="p-8 text-center text-gray-500">
            <FiUser className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Müşteri bulunamadı</h3>
            <p className="text-sm">Arama kriterlerini değiştirebilir veya yeni bir müşteri ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div>
            {/* Sort controls */}
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>Sıralama:</span>
              <button 
                onClick={() => handleSortChange('FullName')}
                className={`px-3 py-1 rounded-full border ${sortBy === 'FullName' ? 'bg-primary-100 border-primary-300' : 'bg-gray-50 border-gray-300'}`}
              >
                İsim {renderSortIndicator('FullName')}
              </button>
              <button 
                onClick={() => handleSortChange('Email')}
                className={`px-3 py-1 rounded-full border ${sortBy === 'Email' ? 'bg-primary-100 border-primary-300' : 'bg-gray-50 border-gray-300'}`}
              >
                E-posta {renderSortIndicator('Email')}
              </button>
            </div>
            
            {/* Grid layout for cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeCustomersList.items.filter((customer: CustomerDto | undefined | null) => customer !== undefined && customer !== null).map((customer: CustomerDto) => {
                // Use type assertion to handle potential casing differences
                const customerAny = customer as any;
                
                // Check for casing issues in properties
                const displayName = customer.fullName || 
                  customerAny.FullName || 
                  `${customer.firstName || customerAny.FirstName || ''} ${customer.lastName || customerAny.LastName || ''}`;
                
                const displayEmail = customer.email || customerAny.Email || '';
                const displayPhone = customer.phoneNumber || customerAny.PhoneNumber || 'Yok';
                
                return (
                  <div 
                    key={customer.id} 
                    className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer p-4"
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiUser className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900 truncate">
                          {displayName}
                        </p>
                        <div className="mt-2 flex flex-col space-y-1">
                          <div className="flex items-center">
                            <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700 truncate">{displayEmail}</span>
                          </div>
                          <div className="flex items-center">
                            <FiPhone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500">{displayPhone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {safeCustomersList.items && safeCustomersList.items.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> -&nbsp;
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, safeCustomersList.totalCount || 0)}
                </span>&nbsp;
                / <span className="font-medium">{safeCustomersList.totalCount || 0}</span> kayıt gösteriliyor
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!safeCustomersList.hasPreviousPage}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    safeCustomersList.hasPreviousPage 
                      ? 'text-gray-500 bg-white hover:bg-gray-50' 
                      : 'text-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <span className="sr-only">Önceki</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page number buttons - showing limited pages */}
                {Array.from({ length: safeCustomersList.totalPages || 0 }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current page
                    return (
                      page === 1 || 
                      page === (safeCustomersList.totalPages || 0) || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there are gaps in page numbers
                    const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                    const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                    
                    return (
                      <React.Fragment key={page}>
                        {showEllipsisBefore && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === page
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {page}
                        </button>
                        
                        {showEllipsisAfter && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
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
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    safeCustomersList.hasNextPage 
                      ? 'text-gray-500 bg-white hover:bg-gray-50' 
                      : 'text-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <span className="sr-only">Sonraki</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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