import React, { useState } from 'react';
import { 
  FaBuilding, 
  FaCalendarAlt, 
  FaBell, 
  FaSave,
  FaSpinner
} from 'react-icons/fa';
import Alert from '@/shared/ui/components/Alert';
import Button from '@/shared/ui/components/Button';
import Card from '@/shared/ui/components/Card';
import {
  useGetBusinessSettingsQuery,
  useGetBookingSettingsQuery,
  useGetNotificationSettingsQuery,
  useUpdateBusinessSettingsMutation,
  useUpdateBookingSettingsMutation,
  useUpdateNotificationSettingsMutation,
} from '@/features/settings';
import BusinessSettingsForm from '@/features/settings/ui/BusinessSettingsForm';
import BookingSettingsForm from '@/features/settings/ui/BookingSettingsForm';
import NotificationSettingsForm from '@/features/settings/ui/NotificationSettingsForm';

type SettingsTab = 'business' | 'booking' | 'notifications';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // RTK Query hooks
  const { 
    data: businessData, 
    isLoading: businessLoading, 
    error: businessError 
  } = useGetBusinessSettingsQuery();
  
  const { 
    data: bookingData, 
    isLoading: bookingLoading, 
    error: bookingError 
  } = useGetBookingSettingsQuery();
  
  const { 
    data: notificationData, 
    isLoading: notificationLoading, 
    error: notificationError 
  } = useGetNotificationSettingsQuery();

  // Mutation hooks
  const [updateBusinessSettings, { isLoading: businessUpdating }] = useUpdateBusinessSettingsMutation();
  const [updateBookingSettings, { isLoading: bookingUpdating }] = useUpdateBookingSettingsMutation();
  const [updateNotificationSettings, { isLoading: notificationUpdating }] = useUpdateNotificationSettingsMutation();

  const tabs = [
    {
      id: 'business' as SettingsTab,
      name: 'İşletme Bilgileri',
      icon: <FaBuilding className="w-5 h-5" />,
      description: 'İşletme adı, adres ve iletişim bilgileri'
    },
    {
      id: 'booking' as SettingsTab,
      name: 'Randevu Ayarları',
      icon: <FaCalendarAlt className="w-5 h-5" />,
      description: 'Randevu alma kuralları ve kısıtlamaları'
    },
    {
      id: 'notifications' as SettingsTab,
      name: 'Bildirim Ayarları',
      icon: <FaBell className="w-5 h-5" />,
      description: 'E-posta ve SMS bildirim tercihleri'
    }
  ];

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'business':
        return (
          <BusinessSettingsForm
            initialData={businessData?.data}
            isLoading={businessLoading}
            error={businessError}
            onSubmit={updateBusinessSettings}
            isSubmitting={businessUpdating}
            onSuccess={() => handleSuccess('İşletme bilgileri başarıyla güncellendi!')}
            onError={() => handleError('İşletme bilgileri güncellenirken bir hata oluştu.')}
          />
        );
      case 'booking':
        return (
          <BookingSettingsForm
            initialData={bookingData?.data}
            isLoading={bookingLoading}
            error={bookingError}
            onSubmit={updateBookingSettings}
            isSubmitting={bookingUpdating}
            onSuccess={() => handleSuccess('Randevu ayarları başarıyla güncellendi!')}
            onError={() => handleError('Randevu ayarları güncellenirken bir hata oluştu.')}
          />
        );
      case 'notifications':
        return (
          <NotificationSettingsForm
            initialData={notificationData?.data}
            isLoading={notificationLoading}
            error={notificationError}
            onSubmit={updateNotificationSettings}
            isSubmitting={notificationUpdating}
            onSuccess={() => handleSuccess('Bildirim ayarları başarıyla güncellendi!')}
            onError={() => handleError('Bildirim ayarları güncellenirken bir hata oluştu.')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
        <p className="mt-2 text-gray-600">
          İşletmenizin ayarlarını ve tercihlerini yönetin
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-6">
          <Alert type="success" message={successMessage} />
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-6">
          <Alert type="error" message={errorMessage} />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <Card className="p-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-6 py-4 flex items-start space-x-3 transition-colors duration-200 ${
                      isActive
                        ? 'bg-red-50 border-r-2 border-red-500 text-red-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`mt-0.5 ${isActive ? 'text-red-500' : 'text-gray-400'}`}>
                      {tab.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isActive ? 'text-red-700' : 'text-gray-900'}`}>
                        {tab.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {tab.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          <Card>
            <div className="p-6">
              {/* Tab Header */}
              <div className="border-b border-gray-200 pb-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="text-red-500">
                    {tabs.find(tab => tab.id === activeTab)?.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {tabs.find(tab => tab.id === activeTab)?.name}
                  </h2>
                </div>
                <p className="text-gray-600 mt-1">
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </p>
              </div>

              {/* Tab Content */}
              {renderTabContent()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings; 