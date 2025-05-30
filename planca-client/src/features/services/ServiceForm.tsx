// src/features/services/ServiceForm.tsx
import { useState, useEffect } from 'react';

import * as React from 'react';
import { useAppSelector } from '@/app/hooks';
import { ServiceDto } from '@/shared/types';
import Button from '@/shared/ui/components/Button';
import { ChromePicker } from 'react-color';

// RTK Query hooks
import {
  useCreateServiceMutation,
  useUpdateServiceMutation
} from './api/servicesAPI';

interface ServiceFormProps {
  selectedService?: ServiceDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ selectedService, onClose, onSuccess }) => {
  const { tenant } = useAppSelector(state => state.auth);
  
  // RTK Query mutations
  const [createService, { 
    isLoading: isCreating, 
    error: createError 
  }] = useCreateServiceMutation();
  
  const [updateService, { 
    isLoading: isUpdating, 
    error: updateError 
  }] = useUpdateServiceMutation();
  
  // Determine if we're editing
  const isEditMode = Boolean(selectedService);
  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;
  
  const [formData, setFormData] = useState<Omit<ServiceDto, 'id'> & { id?: string }>({
    name: '',
    description: '',
    price: 0,
    durationMinutes: 60,
    isActive: true,
    color: '#FF0000',
    tenantId: tenant?.id || ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Load selected service data when editing
  useEffect(() => {
    if (selectedService) {
      setFormData({
        id: selectedService.id,
        name: selectedService.name,
        description: selectedService.description,
        price: selectedService.price,
        durationMinutes: selectedService.durationMinutes,
        isActive: selectedService.isActive,
        color: selectedService.color,
        tenantId: selectedService.tenantId || tenant?.id || ''
      });
    }
  }, [selectedService, tenant]);
  
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
    
    // Handle number inputs
    if (type === 'number') {
      const numValue = name === 'price' ? parseFloat(value) : parseInt(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
      return;
    }
    
    // Handle regular text inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle color change
  const handleColorChange = (color: any) => {
    setFormData(prev => ({ ...prev, color: color.hex }));
    if (errors.color) {
      setErrors(prev => ({ ...prev, color: '' }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Hizmet adı gereklidir';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Hizmet adı en fazla 100 karakter olmalıdır';
    }
    
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Açıklama en fazla 500 karakter olmalıdır';
    }
    
    if (formData.price < 0) {
      newErrors.price = 'Fiyat 0 veya daha büyük olmalıdır';
    }
    
    if (formData.durationMinutes <= 0) {
      newErrors.durationMinutes = 'Süre 0\'dan büyük olmalıdır';
    } else if (formData.durationMinutes > 480) {
      newErrors.durationMinutes = 'Süre en fazla 480 dakika (8 saat) olmalıdır';
    }
    
    if (!formData.color) {
      newErrors.color = 'Renk gereklidir';
    } else if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(formData.color)) {
      newErrors.color = 'Geçerli bir renk kodu giriniz (ör. #FF0000)';
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
      if (isEditMode && formData.id) {
        // Update existing service
        await updateService(formData as ServiceDto).unwrap();
      } else {
        // Create new service
        const { id, ...newService } = formData;
        await createService(newService).unwrap();
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
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-red-600">
          <h3 className="text-xl font-semibold text-white">
            {isEditMode ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Hizmet Adı *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 bg-white border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="Örn. Saç Kesimi"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`mt-1 block w-full px-3 py-2 bg-white border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="Hizmet hakkında bilgi"
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          
          {/* Price and Duration (side by side on larger screens) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Fiyat (₺) *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₺</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`block w-full pl-8 pr-3 py-2 bg-white border ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  disabled={isLoading}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="durationMinutes" className="block text-sm font-medium text-gray-700">
                Süre (dakika) *
              </label>
              <input
                type="number"
                id="durationMinutes"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleChange}
                min="1"
                max="480"
                className={`mt-1 block w-full px-3 py-2 bg-white border ${
                  errors.durationMinutes ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                disabled={isLoading}
              />
              {errors.durationMinutes && (
                <p className="mt-1 text-sm text-red-600">{errors.durationMinutes}</p>
              )}
            </div>
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
              disabled={isLoading}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Aktif
            </label>
          </div>
          
          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Renk *
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-10 h-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                style={{ backgroundColor: formData.color }}
                disabled={isLoading}
              ></button>
              <span className="text-sm text-gray-600">{formData.color}</span>
            </div>
            {showColorPicker && (
              <div className="absolute z-10 mt-2">
                <div className="fixed inset-0" onClick={() => setShowColorPicker(false)}></div>
                <div className="relative z-20">
                  <ChromePicker
                    color={formData.color}
                    onChange={handleColorChange}
                  />
                </div>
              </div>
            )}
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">{errors.color}</p>
            )}
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

export default ServiceForm;