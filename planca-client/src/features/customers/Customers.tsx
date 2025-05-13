import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useParams, useNavigate } from 'react-router-dom';
import CustomersList from './CustomersList';
import CustomerDetail from './CustomerDetail';
import CustomerForm from './CustomerForm';
import AppLayout from '@/components/layouts/AppLayout';
import { clearSelectedCustomer, fetchCustomerById, fetchCustomers } from './customersSlice';
import { CustomerDto } from '@/types';

const Customers: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId?: string }>();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  
  // Detay görünümünde olup olmadığımızı takip edelim
  const isDetailView = Boolean(selectedCustomerId);
  
  // Müşteri listesini belirlenen parametrelerle yükle
  const fetchCustomersWithParams = useCallback((params = {}) => {
    return dispatch(fetchCustomers({
      pageNumber: 1,
      pageSize: 10,
      sortBy: 'LastName',
      sortAscending: true,
      ...params
    }));
  }, [dispatch]);
  
  // Component ilk yüklendiğinde müşteri listesini getir
  useEffect(() => {
    console.log('Customers component mounted, fetching customer list');
    
    // Her durumda listeyi yükle, customerId olsa bile
    fetchCustomersWithParams();
    
    // Periyodik veri yenileme için interval ayarla
    const refreshInterval = setInterval(() => {
      // Detay görünümünde ise sessiz yenileme yap, 
      // aksi takdirde normal yenileme
      if (selectedCustomerId) {
        fetchCustomersWithParams({ 
          silentRefresh: true,
          forceRefresh: false,  // Önbelleği kullanarak API yükünü azalt
          suppressErrors: true  // Hataları bastır
        }).catch(error => {
          console.error('Silent refresh error:', error);
        });
      } else {
        fetchCustomersWithParams({ 
          forceRefresh: true,
          silentRefresh: false  // Tam yenileme yap
        });
      }
    }, 2 * 60 * 1000); // 2 dakika
    
    return () => clearInterval(refreshInterval);
  }, [dispatch, fetchCustomersWithParams, selectedCustomerId]);
  
  // Müşteri detaylarını URL parametresinden yükle
  useEffect(() => {
    if (customerId) {
      setSelectedCustomerId(customerId);
      
      // Hem müşteri detayını hem de müşteri listesini birbirinden bağımsız olarak yükle
      dispatch(fetchCustomerById(customerId))
        .catch(error => {
          console.error('Error fetching customer details:', error);
        });
      
      // Listeyi sessiz bir şekilde yükle, ancak hatayı yakalamak için Promise zinciri kullan
      fetchCustomersWithParams({ 
        silentRefresh: true,
        suppressErrors: true  // Hataları algıla ama kullanıcıya gösterme
      }).catch(error => {
        console.error('Error fetching customers list:', error);
        // Liste yüklemesi başarısız olursa, tekrar dene
        setTimeout(() => {
          fetchCustomersWithParams({ 
            forceRefresh: true, 
            silentRefresh: false 
          });
        }, 1000);
      });
    } else {
      setSelectedCustomerId(null);
      dispatch(clearSelectedCustomer());
    }
  }, [customerId, dispatch, fetchCustomersWithParams]);
  
  // Bir müşteri seçildiğinde
  const handleSelectCustomer = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };
  
  // Randevu oluştur butonuna tıklandığında
  const handleCreateAppointment = (customerId: string) => {
    navigate(`/appointments/create/${customerId}`);
  };
  
  // Müşteri detayı kapatıldığında
  const handleCloseCustomerDetail = () => {
    // Önce yönlendirme yap, sonra temizlik işlemleri yap
    navigate('/customers', { replace: true });
    setSelectedCustomerId(null);
    dispatch(clearSelectedCustomer());
    
    // Sayfaya döndükten sonra kısa bir gecikmeyle listeyi yenile
    setTimeout(() => {
      fetchCustomersWithParams({ 
        forceRefresh: true,
        silentRefresh: false  // Normal yenileme yap
      });
    }, 100);
  };
  
  // Yeni müşteri ekle butonuna tıklandığında
  const handleAddCustomer = () => {
    setShowAddCustomerModal(true);
  };
  
  // Müşteri eklendikten sonra
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {selectedCustomerId ? 'Müşteri Detayları' : 'Müşteriler'}
          </h1>
        </div>
        
        {/* Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* List - hidden on mobile when a customer is selected */}
          <div className={`${selectedCustomerId ? 'lg:col-span-5' : 'lg:col-span-12'} ${selectedCustomerId ? 'hidden lg:block' : ''}`}>
            <CustomersList 
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={handleAddCustomer}
              isDetailViewActive={isDetailView}
            />
          </div>
          
          {/* Details - shows on all screens when a customer is selected */}
          <div className={`lg:col-span-7 ${selectedCustomerId ? '' : 'hidden lg:block'}`}>
            <CustomerDetail 
              onCreateAppointment={handleCreateAppointment}
              onClose={handleCloseCustomerDetail} 
            />
          </div>
        </div>
      </div>
      
      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCancelAddCustomer}></div>
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