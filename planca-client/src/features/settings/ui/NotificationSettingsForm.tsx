import React, { useState, useEffect } from 'react';
import { FaSave, FaSpinner } from 'react-icons/fa';
import Button from '@/shared/ui/components/Button';
import Input from '@/shared/ui/components/Input';
import LoadingScreen from '@/shared/ui/components/LoadingScreen';
import type { NotificationSettingsDto } from '@/shared/types';

interface NotificationSettingsFormProps {
  initialData?: NotificationSettingsDto;
  isLoading?: boolean;
  error?: any;
  onSubmit: (data: NotificationSettingsDto) => Promise<any>;
  isSubmitting?: boolean;
  onSuccess?: () => void;
  onError?: () => void;
}

const NotificationSettingsForm: React.FC<NotificationSettingsFormProps> = ({
  initialData,
  isLoading,
  error,
  onSubmit,
  isSubmitting,
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState<NotificationSettingsDto>({
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    sendBookingConfirmation: true,
    sendBookingReminder: true,
    sendCancellationNotification: true,
    reminderHoursBeforeAppointment: 24,
    notifyEmployeeOnNewBooking: true,
    notifyAdminOnCancellation: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof NotificationSettingsDto) => (
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

    if (formData.reminderHoursBeforeAppointment < 1) {
      newErrors.reminderHoursBeforeAppointment = 'En az 1 saat olmalıdır';
    }

    if (formData.reminderHoursBeforeAppointment > 168) {
      newErrors.reminderHoursBeforeAppointment = 'En fazla 168 saat (7 gün) olabilir';
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
      {/* General Notification Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Genel Bildirim Ayarları</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="emailNotificationsEnabled"
              type="checkbox"
              checked={formData.emailNotificationsEnabled}
              onChange={handleInputChange('emailNotificationsEnabled')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="emailNotificationsEnabled" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">E-posta bildirimleri</span>
              <p className="text-gray-500">E-posta yoluyla bildirim göndermeyi etkinleştir</p>
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="smsNotificationsEnabled"
              type="checkbox"
              checked={formData.smsNotificationsEnabled}
              onChange={handleInputChange('smsNotificationsEnabled')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="smsNotificationsEnabled" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">SMS bildirimleri</span>
              <p className="text-gray-500">SMS yoluyla bildirim göndermeyi etkinleştir</p>
            </label>
          </div>
        </div>
      </div>

      {/* Customer Notifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Müşteri Bildirimleri</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="sendBookingConfirmation"
              type="checkbox"
              checked={formData.sendBookingConfirmation}
              onChange={handleInputChange('sendBookingConfirmation')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="sendBookingConfirmation" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">Randevu onay bildirimi</span>
              <p className="text-gray-500">Randevu alındığında müşteriye onay bildirimi gönder</p>
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="sendBookingReminder"
              type="checkbox"
              checked={formData.sendBookingReminder}
              onChange={handleInputChange('sendBookingReminder')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="sendBookingReminder" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">Randevu hatırlatma</span>
              <p className="text-gray-500">Randevu öncesi müşteriye hatırlatma bildirimi gönder</p>
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="sendCancellationNotification"
              type="checkbox"
              checked={formData.sendCancellationNotification}
              onChange={handleInputChange('sendCancellationNotification')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="sendCancellationNotification" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">İptal bildirimi</span>
              <p className="text-gray-500">Randevu iptal edildiğinde müşteriye bildirim gönder</p>
            </label>
          </div>
        </div>

        {formData.sendBookingReminder && (
          <div className="mt-6">
            <Input
              label="Hatırlatma Zamanı (Saat)"
              type="number"
              value={formData.reminderHoursBeforeAppointment.toString()}
              onChange={handleInputChange('reminderHoursBeforeAppointment')}
              error={errors.reminderHoursBeforeAppointment}
              min="1"
              max="168"
              helpText="Randevu öncesi kaç saat önce hatırlatma gönderilsin"
              className="max-w-xs"
            />
          </div>
        )}
      </div>

      {/* Staff Notifications */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personel Bildirimleri</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="notifyEmployeeOnNewBooking"
              type="checkbox"
              checked={formData.notifyEmployeeOnNewBooking}
              onChange={handleInputChange('notifyEmployeeOnNewBooking')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="notifyEmployeeOnNewBooking" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">Yeni randevu bildirimi</span>
              <p className="text-gray-500">Yeni randevu alındığında ilgili personele bildirim gönder</p>
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="notifyAdminOnCancellation"
              type="checkbox"
              checked={formData.notifyAdminOnCancellation}
              onChange={handleInputChange('notifyAdminOnCancellation')}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="notifyAdminOnCancellation" className="ml-3 text-sm text-gray-700">
              <span className="font-medium">İptal bildirim yöneticisine</span>
              <p className="text-gray-500">Randevu iptal edildiğinde yöneticiye bildirim gönder</p>
            </label>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Bildirim Ayarları Hakkında
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                E-posta bildirimleri için SMTP ayarlarının yapılandırılmış olması gerekir. 
                SMS bildirimleri için SMS sağlayıcısı entegrasyonu gereklidir.
              </p>
            </div>
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

export default NotificationSettingsForm; 