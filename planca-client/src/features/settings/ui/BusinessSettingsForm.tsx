import React, { useState, useEffect } from 'react';
import { FaSave, FaSpinner } from 'react-icons/fa';
import Button from '@/shared/ui/components/Button';
import Input from '@/shared/ui/components/Input';
import LoadingScreen from '@/shared/ui/components/LoadingScreen';
import type { BusinessSettingsDto } from '@/shared/types';

interface BusinessSettingsFormProps {
  initialData?: BusinessSettingsDto;
  isLoading?: boolean;
  error?: any;
  onSubmit: (data: BusinessSettingsDto) => Promise<any>;
  isSubmitting?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
}

const BusinessSettingsForm: React.FC<BusinessSettingsFormProps> = ({
  initialData,
  isLoading,
  error,
  onSubmit,
  isSubmitting,
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState<BusinessSettingsDto>({
    businessName: '',
    businessDescription: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    address: '',
    timeZone: 'UTC',
    currency: 'TRY',
    language: 'tr',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof BusinessSettingsDto) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'İşletme adı zorunludur';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Geçerli bir e-posta adresi girin';
    }

    if (formData.website && !/^https?:\/\//.test(formData.website)) {
      newErrors.website = 'Website adresi http:// veya https:// ile başlamalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onSuccess?.();
    } catch (error) {
      onError?.();
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC' },
    { value: 'Europe/Istanbul', label: 'Türkiye (GMT+3)' },
    { value: 'Europe/London', label: 'Londra (GMT+0)' },
    { value: 'Europe/Berlin', label: 'Berlin (GMT+1)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' },
  ];

  const currencyOptions = [
    { value: 'TRY', label: 'Türk Lirası (₺)' },
    { value: 'USD', label: 'Amerikan Doları ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'İngiliz Sterlini (£)' },
  ];

  const languageOptions = [
    { value: 'tr', label: 'Türkçe' },
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="İşletme Adı *"
          value={formData.businessName}
          onChange={handleInputChange('businessName')}
          error={errors.businessName}
          placeholder="İşletmenizin adını girin"
          required
        />

        <Input
          label="İletişim E-postası"
          type="email"
          value={formData.contactEmail}
          onChange={handleInputChange('contactEmail')}
          error={errors.contactEmail}
          placeholder="info@isletme.com"
        />

        <Input
          label="Telefon Numarası"
          type="tel"
          value={formData.contactPhone}
          onChange={handleInputChange('contactPhone')}
          error={errors.contactPhone}
          placeholder="+90 555 123 45 67"
        />

        <Input
          label="Website"
          type="url"
          value={formData.website}
          onChange={handleInputChange('website')}
          error={errors.website}
          placeholder="https://www.isletme.com"
        />
      </div>

      <div>
        <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-2">
          İşletme Açıklaması
        </label>
        <textarea
          id="businessDescription"
          rows={4}
          value={formData.businessDescription}
          onChange={handleInputChange('businessDescription')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          placeholder="İşletmeniz hakkında kısa bir açıklama..."
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          Adres
        </label>
        <textarea
          id="address"
          rows={3}
          value={formData.address}
          onChange={handleInputChange('address')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          placeholder="İşletmenizin tam adresi..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 mb-2">
            Saat Dilimi
          </label>
          <select
            id="timeZone"
            value={formData.timeZone}
            onChange={handleInputChange('timeZone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            {timezoneOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
            Para Birimi
          </label>
          <select
            id="currency"
            value={formData.currency}
            onChange={handleInputChange('currency')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            {currencyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Dil
          </label>
          <select
            id="language"
            value={formData.language}
            onChange={handleInputChange('language')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <FaSave className="mr-2" />
              Kaydet
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default BusinessSettingsForm; 