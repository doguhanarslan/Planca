import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useParams, useNavigate } from 'react-router-dom';
import CustomersList from '@/features/customers/CustomersList';
import CustomerDetail from '@/features/customers/CustomerDetail';
import CustomerForm from '@/features/customers/CustomerForm';
import AppLayout from '@/shared/ui/layouts/AppLayout';
import { clearSelectedCustomer, fetchCustomerById, fetchCustomers, removeCustomer } from '@/features/customers/customersSlice';
import { CustomerDto } from '@/shared/types';
import { FiUsers, FiPlus, FiArrowLeft, FiTrendingUp, FiCalendar, FiStar, FiEdit } from 'react-icons/fi';

const Customers: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId?: string }>();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<string | null>(null);
  
  // Cache optimization
  const lastFetchTimeRef = useRef<number>(0);
  const minimumFetchInterval = 30000; // 30 seconds
  
  // Detail view tracking
  const isDetailView = Boolean(selectedCustomerId);
  
  // API request tracking
  const customersData = useAppSelector(state => state.customers.customersList);
  const { loading } = useAppSelector(state => state.customers);
  const hasFetchedData = useRef(false);
  
  // Fetch customers with params - optimized
  const fetchCustomersWithParams = useCallback((params: { 
    forceRefresh?: boolean;
    silentRefresh?: boolean;
    suppressErrors?: boolean;
    [key: string]: any; 
  } = {}) => {
    const now = Date.now();
    
    if (now - lastFetchTimeRef.current < minimumFetchInterval && 
        hasFetchedData.current && 
        !params.forceRefresh) {
      console.log('Skipping fetch, using cached data');
      return Promise.resolve(customersData);
    }
    
    lastFetchTimeRef.current = now;
    
    return dispatch(fetchCustomers({
      pageNumber: 1,
      pageSize: 6,
      sortBy: 'LastName',
      sortAscending: true,
      ...params
    }));
  }, [dispatch, customersData]);
  
  // Initial data fetch
  useEffect(() => {
    console.log('Customers component mounted, fetching customer list');
    
    if (!hasFetchedData.current || !customersData) {
      console.log('Initial data fetch triggered');
      fetchCustomersWithParams()
        .then(() => {
          hasFetchedData.current = true;
        });
    }
    
    // Periodic refresh - every 2 minutes
    const refreshInterval = setInterval(() => {
      if (hasFetchedData.current) {
        fetchCustomersWithParams({ 
          silentRefresh: true,
          forceRefresh: false,
          suppressErrors: true
        }).catch(error => {
          console.error('Silent refresh error:', error);
        });
      }
    }, 2 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchCustomersWithParams]);
  
  // Handle URL parameter changes
  useEffect(() => {
    if (!customerId) {
      if (selectedCustomerId !== null) {
        setSelectedCustomerId(null);
        dispatch(clearSelectedCustomer());
      }
      return;
    }
    
    if (selectedCustomerId === customerId) {
      console.log(`Customer ${customerId} is already selected, skipping fetch`);
      return;
    }
    
    setSelectedCustomerId(customerId);
    
    dispatch(fetchCustomerById(customerId))
      .catch(error => {
        console.error('Error fetching customer details:', error);
        setSelectedCustomerId(null);
        dispatch(clearSelectedCustomer());
        navigate('/customers', { replace: true });
      });
  }, [customerId, dispatch, selectedCustomerId, customersData?.items, navigate]);
  
  // Handle customer selection
  const handleSelectCustomer = (customerId: string) => {
    if (selectedCustomerId === customerId) return;
    navigate(`/customers/${customerId}`);
  };
  
  // Handle create appointment
  const handleCreateAppointment = (customerId: string) => {
    navigate(`/appointments/create/${customerId}`);
  };
  
  // Handle close customer detail
  const handleCloseCustomerDetail = () => {
    navigate('/customers', { replace: true });
    dispatch(clearSelectedCustomer());
    setSelectedCustomerId(null);
  };
  
  // Handle add customer
  const handleAddCustomer = () => {
    setShowAddCustomerModal(true);
  };
  
  // Handle customer added
  const handleCustomerAdded = (customer: CustomerDto) => {
    setShowAddCustomerModal(false);
    fetchCustomersWithParams({ forceRefresh: true }).then(() => {
      navigate(`/customers/${customer.id}`, { replace: true });
    });
  };
  
  // Handle cancel add customer
  const handleCancelAddCustomer = () => {
    setShowAddCustomerModal(false);
  };

  // Handle edit customer
  const handleEditCustomer = (customerId: string) => {
    setCustomerToEdit(customerId);
    setShowEditCustomerModal(true);
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await dispatch(removeCustomer(customerId)).unwrap();
      // Navigate back to customers list if the deleted customer was selected
      if (selectedCustomerId === customerId) {
        navigate('/customers', { replace: true });
      }
      // Refresh customer list
      fetchCustomersWithParams({ forceRefresh: true });
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  // Handle customer edited
  const handleCustomerEdited = (customer: CustomerDto) => {
    setShowEditCustomerModal(false);
    setCustomerToEdit(null);
    // Refresh customer list and stay on current customer
    fetchCustomersWithParams({ forceRefresh: true });
  };

  // Handle cancel edit customer
  const handleCancelEditCustomer = () => {
    setShowEditCustomerModal(false);
    setCustomerToEdit(null);
  };

  // Get customer stats
  const customerStats = {
    total: customersData?.totalCount || 0,
    growth: '+12%', // This would come from API
    activeToday: 5, // This would come from API
    avgRating: 4.8 // This would come from API
  };
  
  return (
    <AppLayout>
      {/* Modern Page Header */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            {/* Header Content */}
            <div className="flex items-center space-x-6">
              {isDetailView && (
                <button
                  onClick={handleCloseCustomerDetail}
                  className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <FiArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <FiUsers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {isDetailView ? 'Müşteri Detayları' : 'Müşteriler'}
                  </h1>
                  <p className="text-slate-600 mt-1">
                    {isDetailView 
                      ? 'Müşteri bilgileri ve randevu geçmişi'
                      : 'Tüm müşterilerinizi buradan yönetin'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-4">
              {!isDetailView && (
                <button
                  onClick={handleAddCustomer}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Yeni Müşteri
                </button>
              )}
            </div>
          </div>
          
          {/* Stats Cards - Only show on list view */}
          {!isDetailView && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Toplam Müşteri</p>
                    <p className="text-2xl font-bold text-slate-900">{customerStats.total}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <span className="text-green-600 text-sm font-medium">{customerStats.growth}</span>
                  <span className="text-slate-500 text-sm ml-2">bu ay</span>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Bugün Aktif</p>
                    <p className="text-2xl font-bold text-slate-900">{customerStats.activeToday}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <FiTrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <span className="text-green-600 text-sm font-medium">+2</span>
                  <span className="text-slate-500 text-sm ml-2">dünden</span>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Yaklaşan Randevu</p>
                    <p className="text-2xl font-bold text-slate-900">12</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <span className="text-amber-600 text-sm font-medium">Bu hafta</span>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Ortalama Puan</p>
                    <p className="text-2xl font-bold text-slate-900">{customerStats.avgRating}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FiStar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <span className="text-purple-600 text-sm font-medium">Mükemmel</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`grid gap-8 transition-all duration-300 ${
          isDetailView 
            ? 'lg:grid-cols-12' 
            : 'grid-cols-1'
        }`}>
          {/* Customer List */}
          <div className={`${
            isDetailView 
              ? 'lg:col-span-5 xl:col-span-4' 
              : 'col-span-1'
          } transition-all duration-300`}>
            <CustomersList 
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={handleAddCustomer}
              isDetailViewActive={isDetailView}
              selectedCustomerId={selectedCustomerId}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          </div>
          
          {/* Customer Detail */}
          {isDetailView && (
            <div className="lg:col-span-7 xl:col-span-8 animate-in slide-in-from-right-5 duration-300">
              <CustomerDetail 
                onCreateAppointment={handleCreateAppointment}
                onClose={handleCloseCustomerDetail}
                onEditCustomer={handleEditCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Modern Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={handleCancelAddCustomer}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-sm shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-white" />
              
              <div className="relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/60">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <FiPlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Yeni Müşteri</h2>
                      <p className="text-sm text-slate-600">Yeni müşteri bilgilerini girin</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCancelAddCustomer}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
                  >
                    <FiPlus className="w-5 h-5 text-slate-400 rotate-45" />
                  </button>
                </div>
                
                {/* Form Content */}
                <CustomerForm 
                  onSuccess={handleCustomerAdded} 
                  onCancel={handleCancelAddCustomer} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Edit Customer Modal */}
      {showEditCustomerModal && customerToEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={handleCancelEditCustomer}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-sm shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-white" />
              
              <div className="relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/60">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <FiEdit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Müşteri Düzenle</h2>
                      <p className="text-sm text-slate-600">Müşteri bilgilerini güncelleyin</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCancelEditCustomer}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
                  >
                    <FiPlus className="w-5 h-5 text-slate-400 rotate-45" />
                  </button>
                </div>
                
                {/* Form Content */}
                <CustomerForm 
                  customerId={customerToEdit}
                  onSuccess={handleCustomerEdited} 
                  onCancel={handleCancelEditCustomer} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {loading && hasFetchedData.current && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl px-4 py-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-sm font-medium text-slate-700">Güncelleniyor...</span>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Customers;