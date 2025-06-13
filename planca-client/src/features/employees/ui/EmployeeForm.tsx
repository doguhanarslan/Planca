import { useState, useEffect } from 'react';
import * as React from 'react';
import { useAppSelector } from '@/app/hooks';
import { EmployeeDto, WorkingHoursDto } from '@/shared/types';
import Button from '@/shared/ui/components/Button';
import Input from '@/shared/ui/components/Input';

// RTK Query hooks
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation
} from '../api/employeesAPI';

// Services RTK Query for getting available services
import { useGetActiveServicesQuery } from '@/features/services/api/servicesAPI';

interface EmployeeFormProps {
  selectedEmployee?: EmployeeDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Pazartesi', shortLabel: 'Pzt' },
  { value: 2, label: 'Salı', shortLabel: 'Sal' },
  { value: 3, label: 'Çarşamba', shortLabel: 'Çar' },
  { value: 4, label: 'Perşembe', shortLabel: 'Per' },
  { value: 5, label: 'Cuma', shortLabel: 'Cum' },
  { value: 6, label: 'Cumartesi', shortLabel: 'Cmt' },
  { value: 7, label: 'Pazar', shortLabel: 'Paz' },
];

const EmployeeForm: React.FC<EmployeeFormProps> = ({ selectedEmployee, onClose, onSuccess }) => {
  const { tenant } = useAppSelector(state => state.auth);
  
  // RTK Query mutations
  const [createEmployee, { 
    isLoading: isCreating, 
    error: createError 
  }] = useCreateEmployeeMutation();
  
  const [updateEmployee, { 
    isLoading: isUpdating, 
    error: updateError 
  }] = useUpdateEmployeeMutation();

  // RTK Query for services
  const {
    data: services = [],
    isLoading: servicesLoading,
    error: servicesError,
  } = useGetActiveServicesQuery();
  
  // Determine if we're editing
  const isEditMode = Boolean(selectedEmployee);
  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;
  
  const [formData, setFormData] = useState<Omit<EmployeeDto, 'id'> & { id?: string }>({
    userId: '',
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    title: '',
    isActive: true,
    serviceIds: [],
    workingHours: DAYS_OF_WEEK.map(day => ({
      dayOfWeek: day.value,
      startTime: '09:00',
      endTime: '17:00',
      isWorkingDay: day.value >= 1 && day.value <= 5, // Monday to Friday
    })),
    tenantId: tenant?.id || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load selected employee data when editing
  useEffect(() => {
    if (selectedEmployee) {
      setFormData({
        id: selectedEmployee.id,
        userId: selectedEmployee.userId,
        firstName: selectedEmployee.firstName,
        lastName: selectedEmployee.lastName,
        fullName: selectedEmployee.fullName,
        email: selectedEmployee.email,
        phoneNumber: selectedEmployee.phoneNumber || '',
        title: selectedEmployee.title || '',
        isActive: selectedEmployee.isActive,
        serviceIds: selectedEmployee.serviceIds || [],
        workingHours: selectedEmployee.workingHours?.length > 0 
          ? selectedEmployee.workingHours 
          : DAYS_OF_WEEK.map(day => ({
              dayOfWeek: day.value,
              startTime: '09:00',
              endTime: '17:00',
              isWorkingDay: day.value >= 1 && day.value <= 5,
            })),
        tenantId: selectedEmployee.tenantId || tenant?.id || ''
      });
    }
  }, [selectedEmployee, tenant]);
  
  // Update fullName when firstName or lastName changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      fullName: `${prev.firstName} ${prev.lastName}`.trim()
    }));
  }, [formData.firstName, formData.lastName]);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Handle checkbox
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
      return;
    }
    
    // Handle regular text inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle service selection changes
  const handleServiceChange = (serviceId: string, isSelected: boolean) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: isSelected 
        ? [...prev.serviceIds, serviceId]
        : prev.serviceIds.filter(id => id !== serviceId)
    }));
  };

  // Handle working hours changes
  const handleWorkingHoursChange = (dayOfWeek: number, field: keyof WorkingHoursDto, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh => 
        wh.dayOfWeek === dayOfWeek 
          ? { ...wh, [field]: value }
          : wh
      )
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gereklidir';
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = 'Ad en fazla 50 karakter olmalıdır';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gereklidir';
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = 'Soyad en fazla 50 karakter olmalıdır';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (formData.phoneNumber && formData.phoneNumber.length > 20) {
      newErrors.phoneNumber = 'Telefon numarası en fazla 20 karakter olmalıdır';
    }
    
    if (formData.title && formData.title.length > 100) {
      newErrors.title = 'Görev en fazla 100 karakter olmalıdır';
    }
    
    // Validate working hours
    const hasWorkingDay = formData.workingHours.some(wh => wh.isWorkingDay);
    if (!hasWorkingDay) {
      newErrors.workingHours = 'En az bir çalışma günü seçmelisiniz';
    }
    
    // Validate working hours times
    formData.workingHours.forEach(wh => {
      if (wh.isWorkingDay) {
        if (wh.startTime >= wh.endTime) {
          newErrors.workingHours = 'Başlangıç saati bitiş saatinden önce olmalıdır';
        }
      }
    });
    
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
      if (isEditMode && formData.id) {
        // Update existing employee
        await updateEmployee(formData as EmployeeDto).unwrap();
      } else {
        // Create new employee
        const { id, ...newEmployee } = formData;
        // Generate userId if not provided (for new employees)
        const employeeData = {
          ...newEmployee,
          userId: newEmployee.userId || `user_${Date.now()}`, // Generate userId if needed
        };
        await createEmployee(employeeData).unwrap();
      }
      
      // Success callback
      onSuccess();
    } catch (error) {
      // Error is handled by RTK Query and will be shown in the UI
      console.error('Form submission error:', error);
    }
  };
  
  // Get error message from RTK Query error
  const getErrorMessage = (error: any): string => {
    if (!error) return '';
    
    if ('status' in error) {
      // FetchBaseQueryError
      if (error.data && typeof error.data === 'object') {
        if ('message' in error.data) {
          return error.data.message;
        }
        if ('errors' in error.data && Array.isArray(error.data.errors)) {
          return error.data.errors.join(', ');
        }
      }
      return `Error ${error.status}`;
    }
    
    if ('message' in error) {
      return error.message;
    }
    
    return 'Bir hata oluştu';
  };
  
  return (
    <div className="fixed inset-0 bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-red-600">
          <h3 className="text-xl font-semibold text-white">
            {isEditMode ? 'Personeli Düzenle' : 'Yeni Personel Ekle'}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:cursor-pointer hover:text-gray-300 transition-all duration-300 focus:outline-none"
            disabled={isLoading}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-100 border-b border-red-200">
            <div className="text-red-700 text-sm">
              {getErrorMessage(error)}
            </div>
          </div>
        )}

        {/* Services loading/error */}
        {servicesError && (
          <div className="p-4 bg-yellow-100 border-b border-yellow-200">
            <div className="text-yellow-700 text-sm">
              Hizmetler yüklenirken hata oluştu. Personel oluşturulabilir ancak hizmet ataması yapılamayacak.
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="firstName"
              type="text"
              label="Ad"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              touched={true}
              placeholder="Örn. Ahmet"
              required
              disabled={isLoading}
            />

            <Input
              name="lastName"
              type="text"
              label="Soyad"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              touched={true}
              placeholder="Örn. Yılmaz"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="email"
              type="email"
              label="E-posta"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              touched={true}
              placeholder="ornek@mail.com"
              required
              disabled={isLoading}
            />

            <Input
              name="phoneNumber"
              type="tel"
              label="Telefon"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              touched={true}
              placeholder="+90 xxx xxx xx xx"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="title"
              type="text"
              label="Görev/Ünvan"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              touched={true}
              placeholder="Örn. Kuaför, Masöz"
              disabled={isLoading}
            />

            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Aktif
              </label>
            </div>
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hizmetler
              {servicesLoading && (
                <span className="ml-2 text-xs text-blue-600">Yükleniyor...</span>
              )}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
              {servicesLoading ? (
                <div className="col-span-full text-center py-4 text-gray-500">
                  Hizmetler yükleniyor...
                </div>
              ) : services.length === 0 ? (
                <div className="col-span-full text-center py-4 text-gray-500">
                  Hizmet bulunamadı
                </div>
              ) : (
                services.map((service) => (
                  <div key={service.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      checked={formData.serviceIds.includes(service.id)}
                      onChange={(e) => handleServiceChange(service.id, e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      disabled={isLoading}
                    />
                    <label htmlFor={`service-${service.id}`} className="ml-2 block text-sm text-gray-700 truncate">
                      {service.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Çalışma Saatleri
            </label>
            {errors.workingHours && (
              <p className="mb-2 text-sm text-red-600">{errors.workingHours}</p>
            )}
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => {
                const workingHour = formData.workingHours.find(wh => wh.dayOfWeek === day.value);
                return (
                  <div key={day.value} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-20">
                      <input
                        type="checkbox"
                        id={`day-${day.value}`}
                        checked={workingHour?.isWorkingDay || false}
                        onChange={(e) => handleWorkingHoursChange(day.value, 'isWorkingDay', e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mr-2"
                        disabled={isLoading}
                      />
                      <label htmlFor={`day-${day.value}`} className="text-sm font-medium text-gray-700">
                        {day.label}
                      </label>
                    </div>
                    
                    {workingHour?.isWorkingDay && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Başlangıç</label>
                          <input
                            type="time"
                            value={workingHour.startTime}
                            onChange={(e) => handleWorkingHoursChange(day.value, 'startTime', e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-red-500 focus:border-red-500"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Bitiş</label>
                          <input
                            type="time"
                            value={workingHour.endTime}
                            onChange={(e) => handleWorkingHoursChange(day.value, 'endTime', e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-red-500 focus:border-red-500"
                            disabled={isLoading}
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              type="button"
              size="md"
              className="bg-gray-200 text-black hover:bg-gray-300 focus:ring-gray-400"
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              size="md"
              isLoading={isLoading}
              loadingText={isEditMode ? "Güncelleniyor..." : "Kaydediliyor..."}
              className="bg-red-600 text-white hover:bg-red-900 focus:bg-red-600 hover:cursor-pointer"
              disabled={isLoading}
            >
              {isEditMode ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;