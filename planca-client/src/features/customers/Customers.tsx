import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useParams, useNavigate } from 'react-router-dom';
import CustomersList from './CustomersList';
import CustomerDetail from './CustomerDetail';
import CustomerForm from './CustomerForm';
import AppLayout from '@/components/layouts/AppLayout';
import { clearSelectedCustomer, fetchCustomerById, fetchCustomers } from './customersSlice';
import { CustomerDto } from '@/types';
import { FiPlus } from 'react-icons/fi';

const Customers: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId?: string }>();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  
  // Cache optimization için son fetch request zamanı takibi
  const lastFetchTimeRef = useRef<number>(0);
  const minimumFetchInterval = 30000; // 30 saniye 
  
  // Detay görünümünde olup olmadığımızı takip edelim
  const isDetailView = Boolean(selectedCustomerId);
  
  // API request tracking - son API isteğini izle
  const customersData = useAppSelector(state => state.customers.customersList);
  const hasFetchedData = useRef(false);
  
  // Müşteri listesini belirlenen parametrelerle yükle - optimize edildi
  const fetchCustomersWithParams = useCallback((params: { 
    forceRefresh?: boolean;
    silentRefresh?: boolean;
    suppressErrors?: boolean;
    [key: string]: any; 
  } = {}) => {
    const now = Date.now();
    
    // Son yüklemeden beri yeterince zaman geçti mi?
    if (now - lastFetchTimeRef.current < minimumFetchInterval && 
        hasFetchedData.current && 
        !params.forceRefresh) {
      console.log('Skipping fetch, using cached data');
      return Promise.resolve(customersData);
    }
    
    // API isteği yap ve zamanı güncelle
    lastFetchTimeRef.current = now;
    
    return dispatch(fetchCustomers({
      pageNumber: 1,
      pageSize: 6,
      sortBy: 'LastName',
      sortAscending: true,
      ...params
    }));
  }, [dispatch, customersData]);
  
  // Component ilk yüklendiğinde müşteri listesini getir - optimize edildi
  useEffect(() => {
    console.log('Customers component mounted, fetching customer list');
    
    // İlk yükleme ise ve veri yoksa, verileri yükle
    if (!hasFetchedData.current || !customersData) {
      console.log('Initial data fetch triggered');
      fetchCustomersWithParams()
        .then(() => {
          // Veri başarıyla fetch edildikten sonra flag'i güncelle - boş olsa bile
          hasFetchedData.current = true;
        });
    }
    
    // Periyodik veri yenileme için interval ayarla - 2 dakikada bir
    const refreshInterval = setInterval(() => {
      // Detay görünümünde ise sessiz yenileme yap,
      // aksi takdirde normal yenileme
      if (hasFetchedData.current) { // Sadece ilk fetch tamamlandıysa periyodik yenileme yap
        fetchCustomersWithParams({ 
          silentRefresh: true,
          forceRefresh: false,
          suppressErrors: true
        }).catch(error => {
          console.error('Silent refresh error:', error);
        });
      }
    }, 2 * 60 * 1000); // 2 dakika
    
    return () => clearInterval(refreshInterval);
  }, [fetchCustomersWithParams]);
  
  // Müşteri detaylarını URL parametresinden yükle - optimize edildi
  useEffect(() => {
    // Skip if no customerId in URL
    if (!customerId) {
      // Only clear selection if we currently have a selection
      if (selectedCustomerId !== null) {
        setSelectedCustomerId(null);
        dispatch(clearSelectedCustomer());
      }
      return;
    }
    
    // Skip if already selected (prevents duplicate API calls)
    if (selectedCustomerId === customerId) {
      console.log(`Customer ${customerId} is already selected, skipping fetch`);
      return;
    }
    
    // Update selected ID first to prevent UI flicker
    setSelectedCustomerId(customerId);
    
    // Check if this customer is already in the list
    const isInList = customersData?.items?.some(
      (customer: CustomerDto | null | undefined) => customer && customer.id === customerId
    );
    
    // If customer is in the list, we might be able to use that data
    // But still fetch from API to ensure data is fresh, just with less urgency
    dispatch(fetchCustomerById(customerId))
      .catch(error => {
        console.error('Error fetching customer details:', error);
        // Müşteri bulunamadığında sonsuz döngüyü önlemek için ID'yi temizle
        setSelectedCustomerId(null);
        dispatch(clearSelectedCustomer());
        // Geçersiz müşteri ID'sinden kurtulmak için ana müşteriler sayfasına yönlendir
        navigate('/customers', { replace: true });
      });
  }, [customerId, dispatch, selectedCustomerId, customersData?.items, navigate]);
  
  // Bir müşteri seçildiğinde - optimize edildi
  const handleSelectCustomer = (customerId: string) => {
    // Aynı müşteri zaten seçiliyse işlem yapma
    if (selectedCustomerId === customerId) return;
    navigate(`/customers/${customerId}`);
  };
  
  // Randevu oluştur butonuna tıklandığında
  const handleCreateAppointment = (customerId: string) => {
    navigate(`/appointments/create/${customerId}`);
  };
  
  // Müşteri detayı kapatıldığında - optimize edildi
  const handleCloseCustomerDetail = () => {
    // First update the URL to avoid direct API calls triggered by URL change
    navigate('/customers', { replace: true });
    
    // Ensure we clear any pending/ongoing API calls for customer details
    // by clearing the selected customer immediately
    dispatch(clearSelectedCustomer());
    
    // Only then update the local state
    setSelectedCustomerId(null);
    
    // This navigation will be ignored if we're already at this URL
  };
  
  // Yeni müşteri ekle butonuna tıklandığında
  const handleAddCustomer = () => {
    setShowAddCustomerModal(true);
  };
  
  // Müşteri eklendikten sonra - optimize edildi
  const handleCustomerAdded = (customer: CustomerDto) => {
    setShowAddCustomerModal(false);
    
    // Yeni müşteri ekledikten sonra listeyi yenile ve detaya git
    fetchCustomersWithParams({ forceRefresh: true }).then(() => {
      navigate(`/customers/${customer.id}`, { replace: true });
    });
  };
  
  // Müşteri ekleme iptal edildiğinde
  const handleCancelAddCustomer = () => {
    setShowAddCustomerModal(false);
  };
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with dynamic title and actions */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {selectedCustomerId ? 'Müşteri Detayları' : 'Müşteriler'}
          </h1>
        </div>
        
        {/* Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* List - adjust column widths for better balance */}
          <div className={`${selectedCustomerId ? 'lg:col-span-5 xl:col-span-4' : 'lg:col-span-12'} transition-all duration-300`}>
            <CustomersList 
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={handleAddCustomer}
              isDetailViewActive={isDetailView}
            />
          </div>
          
          {/* Details panel with improved animation */}
          {selectedCustomerId && (
            <div className="lg:col-span-7 xl:col-span-8 animate-fadeInAnim">
              <CustomerDetail 
                onCreateAppointment={handleCreateAppointment}
                onClose={handleCloseCustomerDetail} 
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0  bg-opacity-25 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={handleCancelAddCustomer}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl md:max-w-4xl w-full max-w-[95vw]">
              <CustomerForm 
                onSuccess={handleCustomerAdded} 
                onCancel={handleCancelAddCustomer} 
              />
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Customers;