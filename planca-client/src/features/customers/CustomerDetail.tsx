import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCustomerAppointments } from './customersSlice';
import { CustomerDto, AppointmentDto } from '@/types';
import { format, parseISO } from 'date-fns';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiClock, FiInfo, FiPlus, FiX, FiEdit, FiUserCheck } from 'react-icons/fi';
import CustomerForm from './CustomerForm';
import { debounce } from 'lodash';

interface CustomerDetailProps {
  onCreateAppointment: (customerId: string) => void;
  onClose?: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ onCreateAppointment, onClose }) => {
  const dispatch = useAppDispatch();
  const { selectedCustomer, customerAppointments, loading } = useAppSelector(state => state.customers);
  
  // Local state for appointments filter
  const [filterFutureOnly, setFilterFutureOnly] = useState(true);
  // Düzenleme modu için state
  const [editMode, setEditMode] = useState(false);
  // Track if component is mounted to prevent API calls after unmount
  const isMounted = useRef(true);
  // Track last fetch parameters to avoid duplicate fetches
  const lastFetchParams = useRef({
    customerId: '',
    futureOnly: filterFutureOnly
  });
  
  // State for selected appointment and modal
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Set mounted state on mount and cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Debounced fetch function to prevent rapid API calls
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchAppointments = useCallback(
    debounce((customerId: string, futureOnly: boolean) => {
      if (isMounted.current) {
        console.log(`Fetching appointments for customer ${customerId} with futureOnly=${futureOnly}`);
        dispatch(fetchCustomerAppointments({
          customerId,
          params: {
            futureOnly,
            sortAscending: true
          }
        }));
        
        // Update last fetch params
        lastFetchParams.current = {
          customerId,
          futureOnly
        };
      }
    }, 300),
    [dispatch]
  );
  
  // Check if we need to fetch appointments
  const shouldFetchAppointments = useCallback(() => {
    if (!selectedCustomer) return false;
    
    // If parameters have changed, we need to fetch
    return (
      lastFetchParams.current.customerId !== selectedCustomer.id ||
      lastFetchParams.current.futureOnly !== filterFutureOnly
    );
  }, [selectedCustomer, filterFutureOnly]);
  
  // Fetch customer appointments when customer or filter changes
  useEffect(() => {
    if (isMounted.current && selectedCustomer && shouldFetchAppointments()) {
      // Use debounced fetch to prevent rapid API calls
      debouncedFetchAppointments(selectedCustomer.id, filterFutureOnly);
    }
    
    return () => {
      // This will run when the component unmounts or dependencies change
    };
  }, [selectedCustomer, filterFutureOnly, debouncedFetchAppointments, shouldFetchAppointments]);
  
  // Düzenleme modunu aç
  const handleEditCustomer = () => {
    setEditMode(true);
  };
  
  // Düzenleme işlemi tamamlandığında
  const handleEditSuccess = (updatedCustomer: CustomerDto) => {
    setEditMode(false);
  };
  
  // Düzenleme işlemi iptal edildiğinde
  const handleEditCancel = () => {
    setEditMode(false);
  };
  
  // Handle appointment click to show details
  const handleAppointmentClick = (appointment: AppointmentDto) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };
  
  // Close the appointment details modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };
  
  if (!selectedCustomer) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <FiUser className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No customer selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select a customer from the list to view details
        </p>
      </div>
    );
  }
  
  // Eğer düzenleme modundaysak, düzenleme formunu göster
  if (editMode) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Müşteri Bilgilerini Düzenle</h2>
        </div>
        <CustomerForm 
          initialData={selectedCustomer}
          isEditMode={true}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      </div>
    );
  }
  
  const formatAppointmentTime = (appointment: AppointmentDto) => {
    try {
      const start = parseISO(appointment.startTime);
      const end = parseISO(appointment.endTime);
      
      return {
        date: format(start, 'MMM d, yyyy'),
        time: `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
      };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { date: 'Invalid date', time: 'Invalid time' };
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleCreateAppointment = () => {
    onCreateAppointment(selectedCustomer.id);
  };
  
  const toggleFilter = () => {
    const newFilterValue = !filterFutureOnly;
    setFilterFutureOnly(newFilterValue);
    
    // No need to directly fetch here as the useEffect will handle it
    // when filterFutureOnly changes
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Mobile view close header - only visible on small screens when showing detail view */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
        <h2 className="text-lg font-semibold text-gray-900">Müşteri Detayları</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex items-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:outline-none hover:cursor-pointer"
          >
            <span className="sr-only">Kapat</span>
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Customer info header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
              <FiUser className="h-8 w-8 text-primary-700" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{selectedCustomer.fullName}</h2>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <FiMail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                <span>{selectedCustomer.email || 'E-posta yok'}</span>
              </div>
              {selectedCustomer.phoneNumber && (
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <FiPhone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span>{selectedCustomer.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            {onClose && (
              <button
                onClick={onClose}
                className="hidden lg:inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiX className="mr-2 -ml-1 h-4 w-4" />
                Kapat
              </button>
            )}
            <button
              onClick={handleEditCustomer}
              className="inline-flex items-center hover:cursor-pointer px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiEdit className="mr-2 -ml-1 h-4 w-4" />
              Düzenle
            </button>
            <button
              onClick={handleCreateAppointment}
              className="inline-flex items-center hover:cursor-pointer px-4 py-2 border text-white transition-all duration-300 border-transparent text-sm font-bold rounded-md shadow-sm bg-red-600 hover:bg-red-900 focus:outline-none focus:bg-red-600"
            >
              <FiPlus className="mr-2 -ml-1 h-5 w-5" />
              Yeni Randevu
            </button>
          </div>
        </div>
        
        {/* Notes section */}
        {selectedCustomer.notes && (
          <div className="mt-6 bg-white rounded-md p-4 border border-gray-200">
            <div className="flex items-start">
              <FiInfo className="flex-shrink-0 mt-0.5 mr-2 h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">{selectedCustomer.notes}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Appointments section */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-medium text-gray-900">Randevular</h3>
          <div>
            <button
              onClick={toggleFilter}
              className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                filterFutureOnly
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {filterFutureOnly ? 'Yalnızca Gelecek' : 'Tüm Randevular'}
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="overflow-hidden bg-white rounded-lg border border-gray-200">
            <div className="relative">
              {/* Subtle loading indicator at the top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 overflow-hidden">
                <div className="h-full bg-primary-600 animate-pulse" style={{ width: '40%' }}></div>
              </div>
              
              {/* Skeleton UI for appointments */}
              <ul className="divide-y divide-gray-200">
                {[1, 2, 3].map((item) => (
                  <li key={item} className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        </div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                          <div className="flex flex-col sm:flex-row sm:items-center mt-1 gap-3">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : customerAppointments.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Randevu bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterFutureOnly
                ? 'Bu müşteri için gelecekte randevu bulunmuyor.'
                : 'Bu müşteri için herhangi bir randevu bulunmuyor.'}
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateAppointment}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none "
              >
                <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                Randevu oluştur
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden bg-white rounded-lg border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {customerAppointments.map((appointment: AppointmentDto) => {
                const { date, time } = formatAppointmentTime(appointment);
                return (
                  <li 
                    key={appointment.id} 
                    className="hover:bg-gray-50 transition-all duration-150 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="p-4">
                      {/* Başlık ve durum */}
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-base font-medium text-gray-900">{appointment.serviceName}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      
                      {/* Bilgi satırları */}
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {/* Personel bilgisi */}
                        <div className="flex items-center text-gray-700">
                          <FiUserCheck className="mr-2 h-4 w-4 text-primary-600" />
                          <span>{appointment.employeeName}</span>
                        </div>
                        
                        {/* Tarih bilgisi */}
                        <div className="flex items-center text-gray-700">
                          <FiCalendar className="mr-2 h-4 w-4 text-primary-600" />
                          <span>{date}</span>
                        </div>
                        
                        {/* Saat bilgisi */}
                        <div className="flex items-center text-gray-700 md:col-start-2 md:row-start-1">
                          <FiClock className="mr-2 h-4 w-4 text-primary-600" />
                          <span>{time}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      
      {/* Appointment Details Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 md:mx-auto transform transition-all duration-300 ease-in-out">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiCalendar className="mr-2 h-5 w-5 text-primary-600" />
                Randevu Detayları
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal content */}
            <div className="p-6 space-y-6">
              <div className="divide-y divide-gray-100">
                {/* Service */}
                <div className="flex items-start py-3 first:pt-0">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center drop-shadow-sm">
                      <FiCalendar className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-1">Hizmet</p>
                    <h4 className="text-base font-semibold text-gray-900 truncate">{selectedAppointment.serviceName}</h4>
                  </div>
                </div>
                
                {/* Staff */}
                <div className="flex items-start py-3">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center drop-shadow-sm">
                      <FiUserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-1">Personel</p>
                    <h4 className="text-base font-semibold text-gray-900 truncate">{selectedAppointment.employeeName}</h4>
                  </div>
                </div>
                
                {/* Date and Time */}
                <div className="flex items-start py-3">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center drop-shadow-sm">
                      <FiClock className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-1">Tarih ve Saat</p>
                    <h4 className="text-base font-semibold text-gray-900">
                      {formatAppointmentTime(selectedAppointment).date}
                    </h4>
                    <p className="text-base text-gray-700">
                      {formatAppointmentTime(selectedAppointment).time}
                    </p>
                  </div>
                </div>
                
                {/* Status */}
                <div className="flex items-start py-3">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center drop-shadow-sm">
                      <FiInfo className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-1">Durum</p>
                    <span className={`mt-1 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>
                
                {/* Notes (if available) */}
                {selectedAppointment.notes && (
                  <div className="flex items-start py-3">
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center drop-shadow-sm">
                        <FiInfo className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-1">Notlar</p>
                      <p className="text-base text-gray-700">{selectedAppointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal footer */}
            <div className="flex items-center justify-end p-5 border-t border-gray-100 gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail; 