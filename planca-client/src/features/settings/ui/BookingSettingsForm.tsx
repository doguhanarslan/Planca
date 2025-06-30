import React, { useState, useEffect } from 'react';
import { FaSave, FaSpinner } from 'react-icons/fa';
import Button from '@/shared/ui/components/Button';
import Input from '@/shared/ui/components/Input';
import LoadingScreen from '@/shared/ui/components/LoadingScreen';
import type { BookingSettingsDto } from '@/shared/types';

interface BookingSettingsFormProps {
  initialData?: BookingSettingsDto;
  isLoading?: boolean;
  error?: any;
  onSubmit: (data: BookingSettingsDto) => Promise<any>;
  isSubmitting?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
}

const BookingSettingsForm: React.FC<BookingSettingsFormProps> = ({
  initialData,
  isLoading,
  error,
  onSubmit,
  isSubmitting,
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState<BookingSettingsDto>({
    maxAdvanceBookingDays: 30,
    minAdvanceBookingHours: 1,
    maxCancellationHours: 24,
    requireCustomerPhone: true,
    requireCustomerEmail: true,
    allowOnlineBooking: true,
    autoConfirmBookings: false,
    defaultAppointmentDuration: 60,
    allowBackToBackBookings: true,
    bufferTimeBetweenAppointments: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof BookingSettingsDto) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : 
                  e.target.type === 'number' ? Number(e.target.value) : 
                  e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value,
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

    if (formData.maxAdvanceBookingDays < 1) {
      newErrors.maxAdvanceBookingDays = 'En az 1 gün olmalıdır';
    }

    if (formData.minAdvanceBookingHours < 0) {
      newErrors.minAdvanceBookingHours = 'Negatif değer olamaz';
    }

    if (formData.maxCancellationHours < 0) {
      newErrors.maxCancellationHours = 'Negatif değer olamaz';
    }

    if (formData.defaultAppointmentDuration < 15) {
      newErrors.defaultAppointmentDuration = 'En az 15 dakika olmalıdır';
    }

    if (formData.bufferTimeBetweenAppointments < 0) {
      newErrors.bufferTimeBetweenAppointments = 'Negatif değer olamaz';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Booking Time Limits */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Randevu Zaman Sınırları</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Maksimum Önceden Rezervasyon (Gün)"
            type="number"
            value={formData.maxAdvanceBookingDays.toString()}
            onChange={handleInputChange('maxAdvanceBookingDays')}
            error={errors.maxAdvanceBookingDays}
            min="1"
            helpText="Müşteriler kaç gün öncesinden randevu alabilir"
          />

          <Input
            label="Minimum Önceden Rezervasyon (Saat)"
            type="number"
            value={formData.minAdvanceBookingHours.toString()}
            onChange={handleInputChange('minAdvanceBookingHours')}
            error={errors.minAdvanceBookingHours}
            min="0"
            helpText="Randevu için minimum bekleme süresi"
          />

          <Input
            label="Maksimum İptal Süresi (Saat)"
            type="number"
            value={formData.maxCancellationHours.toString()}
            onChange={handleInputChange('maxCancellationHours')}
            error={errors.maxCancellationHours}
            min="0"
            helpText="Randevu öncesi kaç saate kadar iptal edilebilir"
          />
        </div>
      </div>

      {/* Appointment Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Randevu Ayarları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Varsayılan Randevu Süresi (Dakika)"
            type="number"
            value={formData.defaultAppointmentDuration.toString()}
            onChange={handleInputChange('defaultAppointmentDuration')}
            error={errors.defaultAppointmentDuration}
            min="15"
            step="15"
            helpText="Yeni hizmetler için varsayılan süre"
          />

          <Input
            label="Randevular Arası Boşluk (Dakika)"
            type="number"
            value={formData.bufferTimeBetweenAppointments.toString()}
            onChange={handleInputChange('bufferTimeBetweenAppointments')}
            error={errors.bufferTimeBetweenAppointments}
            min="0"
            step="5"
            helpText="Randevular arasındaki zorunlu bekleme süresi"
          />
        </div>
      </div>

      {/* Customer Requirements */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Müşteri Bilgi Gereksinimleri</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="requireCustomerPhone"
              type="checkbox"
              checked={formData.requireCustomerPhone}
              onChange={handleInputChange('requireCustomerPhone')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="requireCustomerPhone" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">Telefon numarası zorunlu</span>
              <p className="text-gray-500">Müşterilerin telefon numarası vermesi zorunludur</p>
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="requireCustomerEmail"
              type="checkbox"
              checked={formData.requireCustomerEmail}
              onChange={handleInputChange('requireCustomerEmail')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="requireCustomerEmail" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">E-posta adresi zorunlu</span>
              <p className="text-gray-500">Müşterilerin e-posta adresi vermesi zorunludur</p>
            </label>
          </div>
        </div>
      </div>

      {/* Booking Options */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rezervasyon Seçenekleri</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="allowOnlineBooking"
              type="checkbox"
              checked={formData.allowOnlineBooking}
              onChange={handleInputChange('allowOnlineBooking')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="allowOnlineBooking" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">Online randevu almaya izin ver</span>
              <p className="text-gray-500">Müşteriler web sitesi üzerinden randevu alabilir</p>
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="autoConfirmBookings"
              type="checkbox"
              checked={formData.autoConfirmBookings}
              onChange={handleInputChange('autoConfirmBookings')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="autoConfirmBookings" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">Randevuları otomatik onayla</span>
              <p className="text-gray-500">Yeni randevular manuel onay beklemeden otomatik onaylanır</p>
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="allowBackToBackBookings"
              type="checkbox"
              checked={formData.allowBackToBackBookings}
              onChange={handleInputChange('allowBackToBackBookings')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="allowBackToBackBookings" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">Arka arkaya randevulara izin ver</span>
              <p className="text-gray-500">Randevular arasında boşluk olmadan rezervasyon alınabilir</p>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200">
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

export default BookingSettingsForm; 