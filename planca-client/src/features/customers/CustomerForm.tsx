import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createCustomer, updateCustomer } from './customersSlice';
import { CustomerDto } from '@/shared/types';

interface CustomerFormProps {
  onSuccess?: (customer: CustomerDto) => void;
  onCancel?: () => void;
  initialData?: Partial<CustomerDto>;
  isEditMode?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSuccess, onCancel, initialData, isEditMode = false }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CustomerDto>>({
    id: initialData?.id || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phoneNumber: initialData?.phoneNumber || '',
    notes: initialData?.notes || '',
    userId: initialData?.userId || user?.id
  });
  
  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Format phone number as (XXX) XXX XX XX
      const numbers = value.replace(/\D/g, '');
      let formattedNumber = '';
      
      if (numbers.length > 0) {
        formattedNumber = '(' + numbers.substring(0, 3);
        
        if (numbers.length > 3) {
          formattedNumber += ') ' + numbers.substring(3, 6);
          
          if (numbers.length > 6) {
            formattedNumber += ' ' + numbers.substring(6, 8);
            
            if (numbers.length > 8) {
              formattedNumber += ' ' + numbers.substring(8, 10);
            }
          }
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedNumber
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle phone number input to prevent non-digit characters
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, and special keys
    if ([8, 9, 13, 27, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode >= 35 && e.keyCode <= 40) ||
        (e.ctrlKey && [65, 67, 86, 88].indexOf(e.keyCode) !== -1)) {
      return;
    }
    
    // Ensure that it is a number and stop the keypress if not
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
        (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        throw new Error('First name, last name, and email are required');
      }
      
      let resultAction;
      
      // Determine if we're creating a new customer or updating an existing one
      if (isEditMode && formData.id) {
        // Update existing customer
        resultAction = await dispatch(updateCustomer({
          id: formData.id,
          customerData: formData as CustomerDto
        }));
        
        if (updateCustomer.fulfilled.match(resultAction)) {
          // Call success callback with the updated customer
          if (onSuccess) {
            onSuccess(resultAction.payload);
          }
        } else if (updateCustomer.rejected.match(resultAction)) {
          // Handle error
          setError(resultAction.error.message || 'Failed to update customer');
        }
      } else {
        // Create new customer
        resultAction = await dispatch(createCustomer(formData as Omit<CustomerDto, 'id'>));
        
        if (createCustomer.fulfilled.match(resultAction)) {
          // Call success callback with the new customer
          if (onSuccess) {
            onSuccess(resultAction.payload);
          }
        } else if (createCustomer.rejected.match(resultAction)) {
          // Handle error
          setError(resultAction.error.message || 'Failed to create customer');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {isEditMode ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
        </h3>
        
        {error && (
          <div className="mt-4 mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* First name */}
            <div className="sm:col-span-3">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Adı*
              </label>
              <div>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full px-4 py-3 border-gray-300 rounded-md text-base"
                  placeholder="Adı"
                />
              </div>
            </div>
            
            {/* Last name */}
            <div className="sm:col-span-3">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Soyadı*
              </label>
              <div>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full px-4 py-3 border-gray-300 rounded-md text-base"
                  placeholder="Soyadı"
                />
              </div>
            </div>
            
            {/* Email */}
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta adresi*
              </label>
              <div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full px-4 py-3 border-gray-300 rounded-md text-base"
                  placeholder="örnek@email.com"
                />
              </div>
            </div>
            
            {/* Phone */}
            <div className="sm:col-span-3">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon numarası
              </label>
              <div>
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onKeyDown={handlePhoneKeyDown}
                  maxLength={15}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full px-4 py-3 border-gray-300 rounded-md text-base"
                  placeholder="(___) ___ __ __"
                />
              </div>
            </div>
            
            {/* Notes */}
            <div className="sm:col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notlar
              </label>
              <div className="mb-4">
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full px-4 py-3 border-gray-300 rounded-md text-base"
                  placeholder="Müşteri hakkında notlar..."
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Müşteri hakkında ek bilgileri buraya ekleyebilirsiniz.</p>
              </div>
            </div>
          </div>
          
          <div className="pt-5">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="bg-white py-3 hover:cursor-pointer px-6 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm transition-all duration-300 text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-900 hover:cursor-pointer  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...') : (isEditMode ? 'Güncelle' : 'Kaydet')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm; 