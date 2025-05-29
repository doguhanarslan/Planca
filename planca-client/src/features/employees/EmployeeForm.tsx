import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createEmployee, updateEmployee } from './employeesSlice';
import { EmployeeDto, ServiceDto, WorkingHoursDto } from '@/shared/types';
import Button from '@/shared/ui/components/Button';
import { fetchServices } from '@/features/services/servicesSlice';

interface EmployeeFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { selectedEmployee, loading } = useAppSelector(state => state.employees);
  const { services } = useAppSelector(state => state.services);
  const { tenant, user } = useAppSelector(state => state.auth);
  
  // Initial working hours for each day of the week
  const initialWorkingHours = [
    { dayOfWeek: 0, startTime: '09:00:00', endTime: '17:00:00', isWorkingDay: false }, // Sunday
    { dayOfWeek: 1, startTime: '09:00:00', endTime: '17:00:00', isWorkingDay: true },  // Monday
    { dayOfWeek: 2, startTime: '09:00:00', endTime: '17:00:00', isWorkingDay: true },  // Tuesday
    { dayOfWeek: 3, startTime: '09:00:00', endTime: '17:00:00', isWorkingDay: true },  // Wednesday
    { dayOfWeek: 4, startTime: '09:00:00', endTime: '17:00:00', isWorkingDay: true },  // Thursday
    { dayOfWeek: 5, startTime: '09:00:00', endTime: '17:00:00', isWorkingDay: true },  // Friday
    { dayOfWeek: 6, startTime: '09:00:00', endTime: '17:00:00', isWorkingDay: false }, // Saturday
  ];
  
  const [formData, setFormData] = useState<Omit<EmployeeDto, 'id' | 'fullName'> & { id?: string }>({
    userId: user?.id || '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    title: '',
    isActive: true,
    serviceIds: [],
    workingHours: initialWorkingHours
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load services for service selection
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  // Update userId when user changes
  useEffect(() => {
    if (user && !selectedEmployee) {
      setFormData(prev => ({
        ...prev,
        userId: user.id || ''
      }));
    }
  }, [user]);
  
  // Load selected employee data when editing
  useEffect(() => {
    if (selectedEmployee) {
      setFormData({
        id: selectedEmployee.id,
        userId: selectedEmployee.userId,
        firstName: selectedEmployee.firstName,
        lastName: selectedEmployee.lastName,
        email: selectedEmployee.email,
        phoneNumber: selectedEmployee.phoneNumber || '',
        title: selectedEmployee.title || '',
        isActive: selectedEmployee.isActive,
        serviceIds: selectedEmployee.serviceIds,
        workingHours: selectedEmployee.workingHours
      });
    }
  }, [selectedEmployee]);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
      return;
    }
    
    // Handle regular text inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle service selection
  const handleServiceChange = (serviceId: string) => {
    setFormData(prev => {
      const serviceIds = [...prev.serviceIds];
      const index = serviceIds.indexOf(serviceId);
      
      if (index > -1) {
        // Remove service if already selected
        serviceIds.splice(index, 1);
      } else {
        // Add service if not selected
        serviceIds.push(serviceId);
      }
      
      return { ...prev, serviceIds };
    });
  };
  
  // Handle working hours changes
  const handleWorkingHourChange = (dayOfWeek: number, field: 'startTime' | 'endTime' | 'isWorkingDay', value: string | boolean) => {
    setFormData((prev:any) => {
      const workingHours = prev.workingHours.map((day:any) => {
        if (day.dayOfWeek === dayOfWeek) {
          if (field === 'startTime' || field === 'endTime') {
            return { ...day, [field]: value + ':00' }; // Add seconds for backend format
          }
          return { ...day, [field]: value };
        }
        return day;
      });
      
      return { ...prev, workingHours };
    });
  };
  
  // Get day name from day number
  const getDayName = (dayNumber: number): string => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[dayNumber];
  };
  
  // Format time for display
  const formatTime = (time: string): string => {
    if (!time) return '';
    // If time is in format HH:MM:SS, convert to HH:MM
    if (time.includes(':')) {
      const parts = time.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (formData.id) {
        // Edit existing employee
        await dispatch(updateEmployee({ 
          id: formData.id, 
          employeeData: formData as EmployeeDto 
        }));
      } else {
        // Add new employee - ensure user ID is set
        const { id, ...newEmployeeData } = formData;
        const newEmployee = {
          ...newEmployeeData,
          userId: user?.id || formData.userId || ''
        };
        await dispatch(createEmployee(newEmployee));
      }
      
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-red-600">
          <h3 className="text-xl font-semibold text-white">
            {selectedEmployee ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:cursor-pointer hover:text-gray-300 transition-all duration-300 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Kişisel Bilgiler</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Ad *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-white border ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>
              
              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Soyad *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-white border ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-posta *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-white border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Ünvan
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              
              {/* Is Active */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Aktif
                </label>
              </div>
            </div>
          </div>
          
          {/* Services Section */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Verdiği Hizmetler</h4>
            <div className="border border-gray-200 rounded-md p-4">
              {services.length === 0 ? (
                <p className="text-sm text-gray-500">Henüz hiç hizmet tanımlanmamış.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {services.map((service: ServiceDto) => (
                    <div key={service.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`service-${service.id}`}
                        checked={formData.serviceIds.includes(service.id)}
                        onChange={() => handleServiceChange(service.id)}
                        className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label
                        htmlFor={`service-${service.id}`}
                        className="ml-2 block text-sm text-gray-900"
                      >
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Working Hours Section */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Çalışma Saatleri</h4>
            <div className="overflow-hidden bg-white shadow sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {formData.workingHours
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((day) => (
                    <li key={day.dayOfWeek}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`working-day-${day.dayOfWeek}`}
                              checked={day.isWorkingDay}
                              onChange={() => handleWorkingHourChange(day.dayOfWeek, 'isWorkingDay', !day.isWorkingDay)}
                              className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <label
                              htmlFor={`working-day-${day.dayOfWeek}`}
                              className={`ml-3 text-sm font-medium ${day.isWorkingDay ? 'text-gray-900' : 'text-gray-500'}`}
                            >
                              {getDayName(day.dayOfWeek)}
                            </label>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div>
                              <label htmlFor={`start-time-${day.dayOfWeek}`} className="sr-only">
                                Başlangıç Saati
                              </label>
                              <input
                                type="time"
                                id={`start-time-${day.dayOfWeek}`}
                                value={formatTime(day.startTime)}
                                onChange={(e) => handleWorkingHourChange(day.dayOfWeek, 'startTime', e.target.value)}
                                className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                disabled={!day.isWorkingDay}
                              />
                            </div>
                            <span className="text-gray-500">-</span>
                            <div>
                              <label htmlFor={`end-time-${day.dayOfWeek}`} className="sr-only">
                                Bitiş Saati
                              </label>
                              <input
                                type="time"
                                id={`end-time-${day.dayOfWeek}`}
                                value={formatTime(day.endTime)}
                                onChange={(e) => handleWorkingHourChange(day.dayOfWeek, 'endTime', e.target.value)}
                                className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                disabled={!day.isWorkingDay}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          
          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              type="button"
              size="md"
              className="bg-gray-200 text-black hover:bg-gray-300 focus:ring-gray-400"
            >
              İptal
            </Button>
            <Button
              type="submit"
              size="md"
              isLoading={loading}
              loadingText="Kaydediliyor..."
              className="bg-red-600 text-white hover:bg-red-900 focus:bg-red-600 hover:cursor-pointer"
            >
              {selectedEmployee ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm; 