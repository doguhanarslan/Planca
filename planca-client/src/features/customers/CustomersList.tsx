import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCustomers, setSearchString, setSortBy, setSortDirection, fetchCustomerById } from './customersSlice';
import { CustomerDto } from '@/types';

// Import UI components
import { FiSearch, FiUser, FiPhone, FiMail, FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi';

interface CustomersListProps {
  onSelectCustomer: (customerId: string) => void;
  onAddCustomer?: () => void;
}

const CustomersList: React.FC<CustomersListProps> = ({ onSelectCustomer, onAddCustomer }) => {
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
  
  // Local state for current page
  const [currentPage, setCurrentPage] = useState(1);
  
  // Load customers on component mount and when search/sort/page changes
  useEffect(() => {
    dispatch(fetchCustomers({
      pageNumber: currentPage,
      pageSize,
      searchString,
      sortBy,
      sortAscending
    }));
  }, [dispatch, currentPage, pageSize, searchString, sortBy, sortAscending]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchString(e.target.value));
    setCurrentPage(1); // Reset to first page on new search
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
  const safeCustomersList = customersList ?? {
    items: [],
    pageNumber: 1,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header with search and add button */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="relative flex-1 mr-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchString}
            onChange={handleSearchChange}
            placeholder="Search customers..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <button
          onClick={onAddCustomer}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FiPlus className="mr-2 -ml-1 h-5 w-5" />
          Add Customer
        </button>
      </div>
      
      {/* Customer list */}
      <div className="overflow-x-auto">
        {loading && (!safeCustomersList.items || safeCustomersList.items.length === 0) ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (!safeCustomersList.items || safeCustomersList.items.length === 0) ? (
          <div className="p-8 text-center text-gray-500">
            <FiUser className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No customers found</h3>
            <p className="text-sm">Try adjusting your search or add a new customer.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('FullName')}
                >
                  <div className="flex items-center">
                    Name {renderSortIndicator('FullName')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('Email')}
                >
                  <div className="flex items-center">
                    Email {renderSortIndicator('Email')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Phone
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeCustomersList.items.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.fullName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiMail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{customer.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiPhone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">{customer.phoneNumber || 'N/A'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination */}
      {safeCustomersList.items && safeCustomersList.items.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!safeCustomersList.hasPreviousPage}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                safeCustomersList.hasPreviousPage ? 'text-gray-700 bg-white hover:bg-gray-50' : 'text-gray-300 bg-gray-100'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!safeCustomersList.hasNextPage}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                safeCustomersList.hasNextPage ? 'text-gray-700 bg-white hover:bg-gray-50' : 'text-gray-300 bg-gray-100'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, safeCustomersList.totalCount)}
                </span>{' '}
                of <span className="font-medium">{safeCustomersList.totalCount}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!safeCustomersList.hasPreviousPage}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    safeCustomersList.hasPreviousPage ? 'text-gray-500 bg-white hover:bg-gray-50' : 'text-gray-300 bg-gray-100'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: safeCustomersList.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current page
                    return (
                      page === 1 || 
                      page === safeCustomersList.totalPages || 
                      (page >= currentPage - 2 && page <= currentPage + 2)
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
                            page === currentPage
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
                  })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!safeCustomersList.hasNextPage}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    safeCustomersList.hasNextPage ? 'text-gray-500 bg-white hover:bg-gray-50' : 'text-gray-300 bg-gray-100'
                  }`}
                >
                  <span className="sr-only">Next</span>
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