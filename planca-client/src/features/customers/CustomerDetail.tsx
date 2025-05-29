import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMessageSquare, FiCalendar, FiClock, FiTool, FiEdit, FiTrash2, FiX, FiPlus } from 'react-icons/fi';
import { useAppSelector } from '@/app/hooks';
import Button from '@/shared/ui/components/Button';
import Card from '@/shared/ui/components/Card';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// RTK Query hooks
import { 
  useGetCustomerAppointmentsQuery, 
  useDeleteAppointmentMutation,
  useCancelAppointmentMutation 
} from '../appointments/api/appointmentsAPI';

interface CustomerDetailProps {
  onCreateAppointment: (customerId: string) => void;
  onClose: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ onCreateAppointment, onClose }) => {
  const { selectedCustomer } = useAppSelector((state) => state.customers);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'appointments'>('info');

  // RTK Query for customer appointments
  const {
    data: appointments = [],
    isLoading: isLoadingAppointments,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useGetCustomerAppointmentsQuery(
    {
      customerId: selectedCustomer?.id || '',
    },
    {
      // Only fetch if we have a selected customer
      skip: !selectedCustomer?.id,
      // Refetch on mount if data is older than 2 minutes
      refetchOnMountOrArgChange: 120,
      // Refetch on focus
      refetchOnFocus: true,
    }
  );

  // RTK Query mutations
  const [deleteAppointment, { 
    isLoading: isDeletingAppointment 
  }] = useDeleteAppointmentMutation();

  const [cancelAppointment, { 
    isLoading: isCancellingAppointment 
  }] = useCancelAppointmentMutation();

  // Handle delete appointment
  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId).unwrap();
      setShowDeleteConfirm(null);
      // Refresh appointments list
      refetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setShowDeleteConfirm(null);
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = async (appointmentId: string, reason?: string) => {
    try {
      await cancelAppointment({ id: appointmentId, reason }).unwrap();
      // Refresh appointments list
      refetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  if (!selectedCustomer) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FiUser size={24} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Müşteri seçin</h3>
        <p className="text-gray-500">
          Detayları görüntülemek için sol taraftan bir müşteri seçin.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <FiUser size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedCustomer.fullName}</h2>
                <p className="text-red-100">Müşteri Detayları</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => onCreateAppointment(selectedCustomer.id)}
                variant="outline"
                size="sm"
                className="border-white text-white hover:bg-white hover:text-red-600"
                icon={<FiPlus />}
              >
                Randevu Oluştur
              </Button>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 text-white transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FiUser className="mr-2" size={16} />
                Müşteri Bilgileri
              </div>
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'appointments'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <FiCalendar className="mr-2" size={16} />
                Randevular
                {appointments && appointments.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {appointments.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FiUser className="mr-2 text-red-500" />
                  İletişim Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <FiUser className="text-gray-400 mr-3" size={20} />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCustomer.fullName}</p>
                    </div>
                  </div>
                  
                  {selectedCustomer.email && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FiMail className="text-gray-400 mr-3" size={20} />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</p>
                        <p className="text-sm font-medium text-gray-900">{selectedCustomer.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedCustomer.phoneNumber && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <FiPhone className="text-gray-400 mr-3" size={20} />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</p>
                        <p className="text-sm font-medium text-gray-900">{selectedCustomer.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FiMessageSquare className="mr-2 text-red-500" />
                    Notlar
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedCustomer.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FiEdit />}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Düzenle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FiTrash2 />}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Sil
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiCalendar className="mr-2 text-red-500" />
                  Randevular
                </h3>
                <Button
                  onClick={() => onCreateAppointment(selectedCustomer.id)}
                  variant="primary"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  icon={<FiPlus />}
                >
                  Yeni Randevu
                </Button>
              </div>

              {isLoadingAppointments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                  <span className="ml-3 text-gray-600">Randevular yükleniyor...</span>
                </div>
              ) : appointmentsError ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-4">
                    <FiCalendar size={48} className="mx-auto opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Randevular yüklenemedi</h3>
                  <p className="text-gray-500 mb-4">Randevuları yüklerken bir hata oluştu.</p>
                  <Button
                    onClick={() => refetchAppointments()}
                    variant="outline"
                    size="sm"
                  >
                    Tekrar Dene
                  </Button>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <FiCalendar size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Randevu bulunamadı</h3>
                  <p className="text-gray-500 mb-4">Bu müşterinin henüz randevusu bulunmuyor.</p>
                  <Button
                    onClick={() => onCreateAppointment(selectedCustomer.id)}
                    variant="primary"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    icon={<FiPlus />}
                  >
                    İlk Randevuyu Oluştur
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">{appointment.serviceName}</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              appointment.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'canceled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status === 'confirmed' ? 'Onaylandı' : 
                               appointment.status === 'canceled' ? 'İptal Edildi' : 
                               'Beklemede'}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FiClock className="mr-1" size={14} />
                              <span>
                                {format(new Date(appointment.startTime), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FiTool className="mr-1" size={14} />
                              <span>{appointment.employeeName || 'Personel atanmamış'}</span>
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-2 text-sm text-gray-500">
                              <FiMessageSquare className="inline mr-1" size={14} />
                              {appointment.notes}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => setShowDeleteConfirm(appointment.id)}
                            disabled={isDeletingAppointment || isCancellingAppointment}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Randevuyu Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isDeletingAppointment}
              >
                İptal
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDeleteAppointment(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700"
                disabled={isDeletingAppointment}
              >
                {isDeletingAppointment ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;