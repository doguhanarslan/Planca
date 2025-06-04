import { useEffect, ChangeEvent } from 'react';
import { FiCalendar, FiClock, FiUser, FiTool, FiBriefcase, FiMessageSquare, FiX } from 'react-icons/fi';
import { useAvailableTimeSlots } from '../model/hooks/useAvailableTimeSlots';
import { useAppointmentForm } from '../model/hooks/useAppointmentForm';
import { AppointmentDto } from '../../../shared/types';
import { format } from 'date-fns';

// RTK Query hooks
import { useGetActiveServicesQuery } from '../../services/api/servicesAPI';
import { useGetActiveEmployeesQuery } from '../../employees/api/employeesAPI';

interface AppointmentFormProps {
  selectedDate: Date;
  onClose: () => void;
  onSuccess?: () => void;
  appointmentToEdit?: AppointmentDto | null;
}

const AppointmentForm = ({ selectedDate, onClose, onSuccess, appointmentToEdit }: AppointmentFormProps) => {
  // RTK Query for services
  const {
    data: services = [],
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = useGetActiveServicesQuery(undefined, {
    // Refetch on mount if data is older than 5 minutes
    refetchOnMountOrArgChange: 300,
    // Refetch on window focus
    refetchOnFocus: true,
  });

  // RTK Query for employees
  const {
    data: employees = [],
    isLoading: employeesLoading,
    error: employeesError,
    refetch: refetchEmployees,
  } = useGetActiveEmployeesQuery(undefined, {
    // Refetch on mount if data is older than 5 minutes
    refetchOnMountOrArgChange: 300,
    // Refetch on window focus
    refetchOnFocus: true,
  });

  const {
    formState,
    dataState,
    uiState,
    handleSubmit,
  } = useAppointmentForm({
    selectedDate,
    appointmentToEdit,
    onClose,
    onSuccess,
    // Pass external data from RTK Query
    externalServices: services,
    externalEmployees: employees,
  });

  const { 
    customerId, setCustomerId,
    serviceId, setServiceId,
    employeeId, setEmployeeId,
    appointmentDate, setAppointmentDate,
    appointmentTime, setAppointmentTime,
    notes, setNotes,
    customerMessage, setCustomerMessage,
  } = formState;

  const {
    customers,
    availableEmployees,
    selectedServiceDuration,
    selectedEmployeeWorkingHours,
  } = dataState;

  const {
    loading: formLoading,
    error: formError,
    isEditMode,
    isPro,
  } = uiState;

  const { 
    availableTimeSlots, 
    isLoadingAppointments,
    appointmentsError 
  } = useAvailableTimeSlots({
    employeeId,
    appointmentDate,
    selectedServiceDuration,
    services,
    selectedEmployeeWorkingHours,
    isEditMode,
    appointmentToEditId: appointmentToEdit?.id || null,
  });

  // Combine errors from different sources
  const error = formError || 
    (servicesError ? 'Hizmetler yüklenirken bir hata oluştu' : null) ||
    (employeesError ? 'Personeller yüklenirken bir hata oluştu' : null) ||
    (appointmentsError ? 'Randevu verileri yüklenirken bir hata oluştu' : null);
  
  const isLoading = formLoading || servicesLoading || employeesLoading;

  useEffect(() => {
    if (!isLoadingAppointments) {
      if (availableTimeSlots.length > 0 && !availableTimeSlots.includes(appointmentTime)) {
        setAppointmentTime(availableTimeSlots[0]);
      }
    }
  }, [availableTimeSlots, isLoadingAppointments, appointmentTime, setAppointmentTime]);

  const handleServiceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setServiceId(e.target.value);
    setEmployeeId(''); // Reset employee when service changes
  };

  // Handle errors with retry options
  const handleServicesError = () => {
    if (servicesError) {
      refetchServices();
    }
  };

  const handleEmployeesError = () => {
    if (employeesError) {
      refetchEmployees();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {isEditMode ? 'Randevu Düzenle' : 'Yeni Randevu Oluştur'}
        </h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
          aria-label="Kapat"
          disabled={isLoading}
        >
          <FiX size={24} className="text-gray-500" />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <div className="flex space-x-2">
            {servicesError && (
              <button
                onClick={handleServicesError}
                className="ml-2 px-2 py-1 text-xs bg-red-200 hover:bg-red-300 rounded transition-colors"
              >
                Hizmetleri Yenile
              </button>
            )}
            {employeesError && (
              <button
                onClick={handleEmployeesError}
                className="ml-2 px-2 py-1 text-xs bg-red-200 hover:bg-red-300 rounded transition-colors"
              >
                Personelleri Yenile
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Loading indicators */}
      {(servicesLoading || employeesLoading) && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md flex items-center">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span>
            {servicesLoading && employeesLoading ? 'Hizmetler ve personeller yükleniyor...' :
             servicesLoading ? 'Hizmetler yükleniyor...' : 'Personeller yükleniyor...'}
          </span>
        </div>
      )}
      
      <form className="flex-col" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          {/* Customer Selection */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiUser className="mr-2 text-red-500" />
                Müşteri
              </div>
            </label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                disabled={isLoading}
              >
                <option value="">Müşteri seçin</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Service Selection - Enhanced with RTK Query */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiTool className="mr-2 text-red-500" />
                Hizmet
                {servicesLoading && (
                  <div className="ml-2 w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </label>
            <div className="relative">
              <select
                className={`w-full border rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none
                  ${servicesLoading ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}
                  ${servicesError ? 'border-red-300' : ''}`}
                value={serviceId}
                onChange={handleServiceChange}
                required
                disabled={isLoading || servicesLoading}
              >
                {servicesLoading && <option value="">Hizmetler yükleniyor...</option>}
                {!servicesLoading && (
                  <>
                    <option value="">Hizmet seçin</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} (₺{service.price.toLocaleString()})
                      </option>
                    ))}
                  </>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            
            {/* Service-specific status messages */}
            {servicesError && (
              <p className="text-sm text-red-500 mt-1 flex items-center">
                <span>Hizmetler yüklenemedi</span>
                <button
                  type="button"
                  onClick={handleServicesError}
                  className="ml-2 text-xs underline hover:no-underline"
                >
                  Tekrar dene
                </button>
              </p>
            )}
            {!servicesLoading && !servicesError && services.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                Aktif hizmet bulunamadı
              </p>
            )}
          </div>
          
          {/* Employee Selection - Enhanced with RTK Query */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiBriefcase className="mr-2 text-red-500" />
                Personel
                {employeesLoading && (
                  <div className="ml-2 w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </label>
            <div className="relative">
              <select
                className={`w-full border rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none
                  ${employeesLoading ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'}
                  ${employeesError ? 'border-red-300' : ''}`}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                disabled={isLoading || employeesLoading || !serviceId || availableEmployees.length === 0}
              >
                {employeesLoading && <option value="">Personeller yükleniyor...</option>}
                {!employeesLoading && (
                  <>
                    <option value="">
                      {!serviceId ? 'Önce hizmet seçin' : 'Personel seçin'}
                    </option>
                    {availableEmployees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.fullName}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            
            {/* Employee-specific status messages */}
            {employeesError && (
              <p className="text-sm text-red-500 mt-1 flex items-center">
                <span>Personeller yüklenemedi</span>
                <button
                  type="button"
                  onClick={handleEmployeesError}
                  className="ml-2 text-xs underline hover:no-underline"
                >
                  Tekrar dene
                </button>
              </p>
            )}
            {serviceId && availableEmployees.length === 0 && !isLoading && !employeesLoading && (
              <p className="text-sm text-red-500 mt-1">
                Bu hizmet için uygun personel bulunmuyor
              </p>
            )}
            {!employeesLoading && !employeesError && employees.length === 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                Aktif personel bulunamadı
              </p>
            )}
          </div>
          
          {/* Appointment Date */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiCalendar className="mr-2 text-red-500" />
                Tarih
              </div>
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={format(appointmentDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setAppointmentDate(newDate);
                  setAppointmentTime(''); // Reset time when date changes
                }}
                min={format(new Date(), 'yyyy-MM-dd')} // Prevent past dates
                required
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <FiCalendar className="text-gray-400" size={18} />
              </div>
            </div>
          </div>
          
          {/* Appointment Time - Dropdown */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiClock className="mr-2 text-red-500" />
                Saat
                {isLoadingAppointments && (
                  <div className="ml-2 w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
                disabled={isLoading || isLoadingAppointments || availableTimeSlots.length === 0 || !employeeId}
              >
                {isLoadingAppointments && <option value="">Saatler yükleniyor...</option>}
                {!isLoadingAppointments && availableTimeSlots.length > 0 &&
                  availableTimeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                {!isLoadingAppointments && availableTimeSlots.length === 0 && employeeId && (
                  <option value="">Uygun zaman aralığı bulunamadı</option>
                )}
                {!isLoadingAppointments && availableTimeSlots.length === 0 && !employeeId && (
                  <option value="">Personel seçiniz</option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {!isLoadingAppointments && availableTimeSlots.length === 0 && employeeId && (
              <p className="text-sm text-red-500 mt-1">
                Bu tarihte personel müsait değil veya seçilen hizmet için zaman yok.
              </p>
            )}
            
          </div>
          
          {/* Notes */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiMessageSquare className="mr-2 text-red-500" />
                Notlar
              </div>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bu randevu hakkında notlar ekleyin"
              disabled={isLoading}
            />
          </div>
          
          {/* Customer Message (Pro feature) */}
          {isPro && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FiMessageSquare className="mr-2 text-red-500" />
                  Müşteri Mesajı
                  <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    PRO
                  </span>
                </div>
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="Müşteriye gönderilecek mesaj"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Bu mesaj müşteriye gönderilecektir (Pro özelliği)
              </p>
            </div>
          )}
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 shadow-sm rounded-md text-gray-700 hover:bg-gray-100 border border-gray-300 focus:outline-none hover:cursor-pointer duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={isLoading || isLoadingAppointments}
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 shadow-sm rounded-md text-white hover:bg-red-700 focus:outline-none bg-red-600 hover:cursor-pointer duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isLoading || isLoadingAppointments || availableTimeSlots.length === 0 || !serviceId || !customerId || !employeeId}
          >
            {(isLoading || isLoadingAppointments) && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            )}
            {(isLoading || isLoadingAppointments) ? 'İşleniyor...' : isEditMode ? 'Randevuyu Güncelle' : 'Randevu Oluştur'}
          </button>
        </div>
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs text-gray-600">
            <div>Services: {services.length} loaded, Loading: {servicesLoading.toString()}</div>
            <div>Employees: {employees.length} loaded, Loading: {employeesLoading.toString()}</div>
            <div>Available employees: {availableEmployees.length}</div>
            <div>Available time slots: {availableTimeSlots.length}</div>
            <div>Form loading: {isLoading.toString()}</div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AppointmentForm;