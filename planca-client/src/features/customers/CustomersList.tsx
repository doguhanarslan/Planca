import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiPlus, FiSearch, FiFilter,FiSkipBack, FiPhone, FiMail, FiCalendar, FiMoreVertical, FiTrash2, FiEdit, FiEye } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCustomers, setSearchString, setSortBy, setSortDirection, removeCustomer } from './customersSlice';
import { isHandling401Error } from '@/shared/api/base/axios';
import { debounce } from 'lodash';
import { CustomerDto } from '@/shared/types';
import Button from '@/shared/ui/components/Button';
import Alert from '@/shared/ui/components/Alert';

// RTK Query hooks for appointments
import { 
  useGetCustomerAppointmentsQuery, 
  useDeleteAppointmentMutation 
} from '../appointments/api/appointmentsAPI';

interface CustomersListProps {
  onSelectCustomer: (customerId: string) => void;
  onAddCustomer: () => void;
  isDetailViewActive?: boolean;
}

const CustomersList: React.FC<CustomersListProps> = ({
  onSelectCustomer,
  onAddCustomer,
  isDetailViewActive = false
}) => {
  const dispatch = useAppDispatch();
  const { 
    customersList, 
    loading, 
    error, 
    searchString, 
    sortBy, 
    sortDirection 
  } = useAppSelector((state) => state.customers);

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedCustomerForAppointments, setSelectedCustomerForAppointments] = useState<string | null>(null);

  // RTK Query mutations
  const [deleteAppointment, { 
    isLoading: isDeletingAppointment 
  }] = useDeleteAppointmentMutation();

  // RTK Query for customer appointments (conditionally)
  const {
    data: customerAppointments = [],
    isLoading: isLoadingAppointments,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useGetCustomerAppointmentsQuery(
    {
      customerId: selectedCustomerForAppointments || '',
    },
    {
      // Only fetch if we have a selected customer
      skip: !selectedCustomerForAppointments,
      // Refetch on mount if data is older than 2 minutes
      refetchOnMountOrArgChange: 120,
    }
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      dispatch(setSearchString(searchTerm));
      dispatch(fetchCustomers({ 
        pageNumber: 1, 
        pageSize: 6, 
        searchString: searchTerm,
        sortBy,
        sortAscending: sortDirection === 'asc'
      }));
    }, 300),
    [dispatch, sortBy, sortDirection]
  );

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    debouncedSearch(value);
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    const newDirection = (sortBy === field && sortDirection === 'asc') ? 'desc' : 'asc';
    dispatch(setSortBy(field));
    dispatch(setSortDirection(newDirection as any));
    
    dispatch(fetchCustomers({
      pageNumber: 1,
      pageSize: 6,
      searchString,
      sortBy: field,
      sortAscending: newDirection === 'asc'
    }));
  };

  // Handle customer appointments view
  const handleViewAppointments = (customerId: string) => {
    setSelectedCustomerForAppointments(customerId);
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId).unwrap();
      // Refresh appointments after deletion
      if (selectedCustomerForAppointments) {
        refetchAppointments();
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await dispatch(removeCustomer(customerId)).unwrap();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    dispatch(setSearchString(''));
    dispatch(setSortBy('lastName'));
    dispatch(setSortDirection('asc'));
    dispatch(fetchCustomers({ 
      pageNumber: 1, 
      pageSize: 6, 
      searchString: '',
      sortBy: 'lastName',
      sortAscending: true
    }));
  };

  // Fetch customers on component mount
  useEffect(() => {
    if (!customersList || customersList.items.length === 0) {
      dispatch(fetchCustomers({ 
        pageNumber: 1, 
        pageSize: 6, 
        sortBy: 'lastName',
        sortAscending: true
      }));
    }
  }, [dispatch, customersList]);

  // Memoized customers list
  const customers = useMemo(() => {
    return customersList?.items || [];
  }, [customersList]);

  // Loading state
  if (loading && customers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Müşteriler yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isHandling401Error()) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <Alert 
          type="error" 
          message={Array.isArray(error) ? error.join(', ') : error}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-semibold text-black flex items-center">
          <FiUser className="mr-2 text-red-500" />
          Müşteriler
          {loading && customers.length > 0 && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
              Güncelleniyor...
            </span>
          )}
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md shadow-sm transition-colors duration-200"
          >
            <FiFilter className="mr-1" />
            {showFilters ? 'Filtreleri Gizle' : 'Filtrele'}
          </button>
          
          <Button
            onClick={onAddCustomer}
            variant="primary"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            icon={<FiPlus />}
          >
            Yeni Müşteri
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Ara
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  defaultValue={searchString}
                  onChange={handleSearchChange}
                  placeholder="İsim, soyisim, email veya telefon"
                  className="w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sıralama
              </label>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  handleSortChange(field);
                }}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="lastName-asc">Soyisme göre (A-Z)</option>
                <option value="lastName-desc">Soyisme göre (Z-A)</option>
                <option value="firstName-asc">İsme göre (A-Z)</option>
                <option value="firstName-desc">İsme göre (Z-A)</option>
                <option value="email-asc">E-postaya göre (A-Z)</option>
                <option value="email-desc">E-postaya göre (Z-A)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-100 transition-colors"
            >
              <FiSkipBack className="mr-1" />
              Filtreleri Temizle
            </button>
          </div>
        </div>
      )}
      
      {/* Customer List */}
      <div className="divide-y divide-gray-200">
        {customers.length === 0 && !loading ? (
          <div className="p-8 text-center text-gray-500">
            {searchString ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Henüz müşteri eklenmemiş.'}
          </div>
        ) : (
          customers.map((customer: CustomerDto) => (
            <div
              key={customer.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                isDetailViewActive ? 'bg-blue-50 border-l-4 border-red-500' : ''
              }`}
              onClick={() => onSelectCustomer(customer.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <FiUser className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">
                        {customer.fullName}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        {customer.email && (
                          <div className="flex items-center">
                            <FiMail className="mr-1" size={12} />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                        {customer.phoneNumber && (
                          <div className="flex items-center">
                            <FiPhone className="mr-1" size={12} />
                            <span>{customer.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions dropdown */}
                <div className="flex-shrink-0 ml-2">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAppointments(customer.id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiCalendar size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Show appointments if selected */}
              {selectedCustomerForAppointments === customer.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Randevular</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomerForAppointments(null);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Gizle
                    </button>
                  </div>
                  
                  {isLoadingAppointments ? (
                    <div className="flex items-center text-gray-500 text-sm">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Randevular yükleniyor...
                    </div>
                  ) : appointmentsError ? (
                    <div className="text-sm text-red-600">
                      Randevular yüklenirken hata oluştu
                    </div>
                  ) : customerAppointments.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      Bu müşterinin randevusu bulunmuyor.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customerAppointments.slice(0, 3).map((appointment) => (
                        <div 
                          key={appointment.id}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                        >
                          <div>
                            <div className="font-medium">{appointment.serviceName}</div>
                            <div className="text-gray-500">
                              {new Date(appointment.startTime).toLocaleDateString('tr-TR')} - 
                              {new Date(appointment.startTime).toLocaleTimeString('tr-TR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAppointment(appointment.id);
                            }}
                            disabled={isDeletingAppointment}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {customerAppointments.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{customerAppointments.length - 3} randevu daha
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {customersList && customersList.totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Toplam <span className="font-medium">{customersList.totalCount}</span> müşteri
                {customersList.totalPages > 1 && (
                  <span> (Sayfa <span className="font-medium">{customersList.pageNumber}</span> / <span className="font-medium">{customersList.totalPages}</span>)</span>
                )}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (customersList.pageNumber > 1) {
                    dispatch(fetchCustomers({
                      pageNumber: customersList.pageNumber - 1,
                      pageSize: 6,
                      searchString,
                      sortBy,
                      sortAscending: sortDirection === 'asc'
                    }));
                  }
                }}
                disabled={customersList.pageNumber <= 1 || loading}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  customersList.pageNumber <= 1 || loading
                  ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                } transition-colors`}
              >
                Önceki
              </button>
              <button
                onClick={() => {
                  if (customersList.pageNumber < customersList.totalPages) {
                    dispatch(fetchCustomers({
                      pageNumber: customersList.pageNumber + 1,
                      pageSize: 6,
                      searchString,
                      sortBy,
                      sortAscending: sortDirection === 'asc'
                    }));
                  }
                }}
                disabled={customersList.pageNumber >= customersList.totalPages || loading}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  customersList.pageNumber >= customersList.totalPages || loading
                  ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                } transition-colors`}
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Müşteriyi Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve müşteriye ait tüm randevular da silinecektir.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                İptal
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDeleteCustomer(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;