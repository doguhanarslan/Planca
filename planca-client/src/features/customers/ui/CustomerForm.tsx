import { FC, useState, useEffect, ChangeEvent, KeyboardEvent, FormEvent } from 'react';
import { useAppSelector } from '@/app/hooks';
import { CustomerFormProps, CustomerFormData, validateCustomerData, formatPhoneNumber } from '../model';
import { useCreateCustomerMutation, useUpdateCustomerMutation, useGetCustomerByIdQuery } from '../api/customersAPI';
import { FiUser, FiPlus, FiEdit, FiX } from 'react-icons/fi';
import Alert from '@/shared/ui/components/Alert';

const CustomerForm: FC<CustomerFormProps> = ({ 
  customerId, 
  onSuccess, 
  onCancel, 
  isEditMode = Boolean(customerId) 
}) => {
  const { user } = useAppSelector(state => state.auth);
  
  // RTK Query hooks
  const { data: existingCustomer, isLoading: isLoadingCustomer } = useGetCustomerByIdQuery(
    customerId || '', 
    { skip: !customerId || !isEditMode }
  );
  
  const [createCustomer, { isLoading: isCreating, error: createError }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating, error: updateError }] = useUpdateCustomerMutation();
  
  const isSubmitting = isCreating || isUpdating;
  const apiError = createError || updateError;
  
  // Form state
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    notes: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load existing customer data for edit mode
  useEffect(() => {
    if (isEditMode && existingCustomer) {
      setFormData({
        firstName: existingCustomer.firstName || '',
        lastName: existingCustomer.lastName || '',
        email: existingCustomer.email || '',
        phoneNumber: existingCustomer.phoneNumber || '',
        notes: existingCustomer.notes || ''
      });
    }
  }, [isEditMode, existingCustomer]);
  
  // Handle field changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
    
    // Special handling for phone number formatting
    if (name === 'phoneNumber') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle phone number input to prevent non-digit characters
  const handlePhoneKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, and navigation keys
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
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateCustomerData(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    try {
      let result;
      
      if (isEditMode && customerId) {
        // Update existing customer
        result = await updateCustomer({
          id: customerId,
          ...formData
        }).unwrap();
      } else {
        // Create new customer
        result = await createCustomer(formData).unwrap();
      }
      
      // Success callback
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} customer:`, error);
      // Error is handled by RTK Query error state
    }
  };

  // Get API error message
  const getErrorMessage = () => {
    if (!apiError) return null;
    
    if ('data' in apiError && apiError.data) {
      return typeof apiError.data === 'string' ? apiError.data : 'Bir hata oluştu';
    }
    
    if ('message' in apiError) {
      return apiError.message;
    }
    
    return 'Bilinmeyen bir hata oluştu';
  };

  // Loading state for edit mode
  if (isEditMode && isLoadingCustomer) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200"></div>
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-600">Müşteri bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white">
      <div className="px-8 py-6">
        {/* Error Display */}
        {apiError && (
          <div className="mb-6">
            <Alert 
              type="error" 
              message={getErrorMessage() || 'Bir hata oluştu'} 
            />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* First name */}
            <div className="sm:col-span-3">
              <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base ${
                    validationErrors.firstName 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                  placeholder="Adı"
                />
                {validationErrors.firstName && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.firstName}</p>
                )}
              </div>
            </div>
            
            {/* Last name */}
            <div className="sm:col-span-3">
              <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base ${
                    validationErrors.lastName 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                  placeholder="Soyadı"
                />
                {validationErrors.lastName && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.lastName}</p>
                )}
              </div>
            </div>
            
            {/* Email */}
            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base ${
                    validationErrors.email 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                  placeholder="örnek@email.com"
                />
                {validationErrors.email && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>
            </div>
            
            {/* Phone */}
            <div className="sm:col-span-3">
              <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base ${
                    validationErrors.phoneNumber 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                  placeholder="(___) ___ __ __"
                />
                {validationErrors.phoneNumber && (
                  <p className="mt-2 text-sm text-red-600">{validationErrors.phoneNumber}</p>
                )}
              </div>
            </div>
            
            {/* Notes */}
            <div className="sm:col-span-6">
              <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 mb-2">
                Notlar
              </label>
              <div className="mb-4">
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-base bg-white hover:border-slate-400"
                  placeholder="Müşteri hakkında notlar..."
                />
              </div>
              <div>
                <p className="text-sm text-slate-500">Müşteri hakkında ek bilgileri buraya ekleyebilirsiniz.</p>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-200">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 border border-slate-300 text-slate-700 font-medium text-base rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiX className="w-4 h-4 mr-2" />
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-base rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isEditMode ? 'Güncelleniyor...' : 'Kaydediliyor...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? <FiEdit className="w-4 h-4 mr-2" /> : <FiPlus className="w-4 h-4 mr-2" />}
                    {isEditMode ? 'Güncelle' : 'Kaydet'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm; 