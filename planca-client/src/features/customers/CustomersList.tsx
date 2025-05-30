import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiPlus, FiSearch, FiFilter, FiPhone, FiMail, FiCalendar, FiMoreVertical, FiTrash2, FiEdit, FiEye, FiX, FiChevronRight } from 'react-icons/fi';
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
  selectedCustomerId?: string;
}
 const CustomersList: React.FC<CustomersListProps> = ({
  onSelectCustomer,
  onAddCustomer,
  isDetailViewActive = false,
  selectedCustomerId
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
      skip: !selectedCustomerForAppointments,
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
    setSelectedCustomerForAppointments(
      selectedCustomerForAppointments === customerId ? null : customerId
    );
  };

  // Handle delete appointment
  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId).unwrap();
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
    dispatch(setSortDirection(true));
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
            <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-600 font-medium">Müşteriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isHandling401Error()) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 shadow-lg">
        <Alert 
          type="error" 
          message={Array.isArray(error) ? error.join(', ') : error}
        />
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg overflow-hidden">
      {/* Modern Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Müşteriler</h2>
              <p className="text-sm text-slate-500">
                {customersList?.totalCount ? `${customersList.totalCount} müşteri` : 'Müşteri listesi'}
              </p>
            </div>
            {loading && customers.length > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-xs font-medium">Güncelleniyor</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                showFilters 
                  ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FiFilter className="w-4 h-4 mr-2" />
              {showFilters ? 'Filtreleri Gizle' : 'Filtrele'}
            </button>
            
            <button
              onClick={onAddCustomer}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Yeni Müşteri
            </button>
          </div>
        </div>
      </div>
      
      {/* Modern Filters */}
      {showFilters && (
        <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-200/60">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Ara
              </label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  defaultValue={searchString}
                  onChange={handleSearchChange}
                  placeholder="İsim, email veya telefon ile ara..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Sıralama
              </label>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  handleSortChange(field);
                }}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
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
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 text-sm font-medium"
            >
              <FiX className="w-4 h-4 mr-2" />
              Filtreleri Temizle
            </button>
          </div>
        </div>
      )}
      
      {/* Modern Customer List */}
      <div className="divide-y divide-slate-200/60">
        {customers.length === 0 && !loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FiUser className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchString ? 'Müşteri bulunamadı' : 'Henüz müşteri yok'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchString 
                ? 'Arama kriterlerinize uygun müşteri bulunamadı.' 
                : 'Başlamak için ilk müşterinizi ekleyin.'
              }
            </p>
            {!searchString && (
              <button
                onClick={onAddCustomer}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                İlk Müşteriyi Ekle
              </button>
            )}
          </div>
        ) : (
          customers.map((customer: CustomerDto) => (
            <div
              key={customer.id}
              className={`relative px-6 py-5 cursor-pointer transition-all duration-200 hover:bg-slate-50/50 group ${
                selectedCustomerId === customer.id 
                  ? 'bg-indigo-50/50 border-r-4 border-indigo-500' 
                  : ''
              }`}
              onClick={() => onSelectCustomer(customer.id)}
            >
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                  {selectedCustomerId === customer.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* Customer Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-slate-900 truncate">
                      {customer.fullName}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-6 mt-1">
                    {customer.email && (
                      <div className="flex items-center text-slate-500">
                        <FiMail className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-sm truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phoneNumber && (
                      <div className="flex items-center text-slate-500">
                        <FiPhone className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-sm">{customer.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewAppointments(customer.id);
                    }}
                    className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all duration-200"
                  >
                    <FiCalendar className="w-4 h-4 text-slate-600" />
                  </button>
                  
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors duration-200">
                    <FiChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                </div>
              </div>
              
              {/* Appointments Expansion */}
              {selectedCustomerForAppointments === customer.id && (
                <div className="mt-5 pt-5 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2 text-indigo-500" />
                      Randevular
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomerForAppointments(null);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                    >
                      <FiX className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  
                  {isLoadingAppointments ? (
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                      <span className="text-sm text-slate-600">Randevular yükleniyor...</span>
                    </div>
                  ) : appointmentsError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-700">Randevular yüklenirken hata oluştu</p>
                    </div>
                  ) : customerAppointments.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                      <p className="text-sm text-slate-500">Bu müşterinin randevusu bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerAppointments.slice(0, 3).map((appointment) => (
                        <div 
                          key={appointment.id}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all duration-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-slate-900">{appointment.serviceName}</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Aktif
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {new Date(appointment.startTime).toLocaleDateString('tr-TR')} - 
                              {new Date(appointment.startTime).toLocaleTimeString('tr-TR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAppointment(appointment.id);
                            }}
                            disabled={isDeletingAppointment}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {customerAppointments.length > 3 && (
                        <div className="text-center pt-2">
                          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            +{customerAppointments.length - 3} randevu daha
                          </span>
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
      
      {/* Modern Pagination */}
      {customersList && customersList.totalPages > 1 && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium">{customersList.totalCount}</span> müşteri
              {customersList.totalPages > 1 && (
                <span className="ml-2">
                  (Sayfa <span className="font-medium">{customersList.pageNumber}</span> / 
                  <span className="font-medium">{customersList.totalPages}</span>)
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
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
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  customersList.pageNumber <= 1 || loading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-sm'
                }`}
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
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  customersList.pageNumber >= customersList.totalPages || loading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-sm'
                }`}
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modern Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Müşteriyi Sil</h3>
                <p className="text-sm text-slate-500">Bu işlem geri alınamaz</p>
              </div>
            </div>
            
            <p className="text-slate-600 mb-8">
              Bu müşteriyi silmek istediğinizden emin misiniz? Müşteriye ait tüm randevular da silinecektir.
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDeleteCustomer(showDeleteConfirm)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
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