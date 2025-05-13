import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createCustomer } from './customersSlice';
import { CustomerDto } from '@/types';

interface CustomerFormProps {
  onSuccess?: (customer: CustomerDto) => void;
  onCancel?: () => void;
  initialData?: Partial<CustomerDto>;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CustomerDto>>({
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      
      // Submit the form data
      const resultAction = await dispatch(createCustomer(formData as Omit<CustomerDto, 'id'>));
      
      if (createCustomer.fulfilled.match(resultAction)) {
        // Call success callback with the new customer
        if (onSuccess) {
          onSuccess(resultAction.payload);
        }
      } else if (createCustomer.rejected.match(resultAction)) {
        // Handle error
        setError(resultAction.error.message || 'Failed to create customer');
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
          {initialData?.id ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
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
              <div>
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
              <p className="mt-2 text-sm text-gray-500">Müşteri hakkında ek bilgileri buraya ekleyebilirsiniz.</p>
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
                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm; 