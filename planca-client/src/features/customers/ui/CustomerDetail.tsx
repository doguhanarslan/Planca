import { useState, useEffect, useRef } from 'react';
import * as React from 'react';
import { FiUser, FiMail, FiPhone, FiMessageSquare, FiCalendar, FiClock, FiTool, FiEdit, FiTrash2, FiX, FiPlus, FiStar, FiActivity, FiMoreVertical, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { CustomerDetailProps, formatCustomerName, getCustomerInitials } from '../model';
import { useGetCustomerByIdQuery, useDeleteCustomerMutation } from '../api/customersAPI';
import { useGetCustomerAppointmentsQuery, useDeleteAppointmentMutation, useCancelAppointmentMutation } from '../../appointments/api/appointmentsAPI';
import Button from '@/shared/ui/components/Button';
import Alert from '@/shared/ui/components/Alert';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface CustomerDetailPropsWithId extends CustomerDetailProps {
  customerId: string | null;
}

const CustomerDetail: React.FC<CustomerDetailPropsWithId> = ({ 
  customerId,
  onCreateAppointment, 
  onClose, 
  onEditCustomer, 
  onDeleteCustomer 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDeleteCustomerConfirm, setShowDeleteCustomerConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'appointments' | 'history'>('info');
  const [showMoreActions, setShowMoreActions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // RTK Query hooks
  const {
    data: selectedCustomer,
    isLoading: isLoadingCustomer,
    error: customerError,
  } = useGetCustomerByIdQuery(customerId || '', {
    skip: !customerId,
  });

  const {
    data: appointments = [],
    isLoading: isLoadingAppointments,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useGetCustomerAppointmentsQuery(
    { customerId: customerId || '' },
    {
      skip: !customerId,
      refetchOnMountOrArgChange: 120,
      refetchOnFocus: true,
    }
  );

  // RTK Query mutations
  const [deleteAppointment, { isLoading: isDeletingAppointment }] = useDeleteAppointmentMutation();
  const [cancelAppointment, { isLoading: isCancellingAppointment }] = useCancelAppointmentMutation();
  const [deleteCustomer, { isLoading: isDeletingCustomer }] = useDeleteCustomerMutation();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMoreActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle delete appointment
  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await deleteAppointment(appointmentId).unwrap();
      setShowDeleteConfirm(null);
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
      refetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      await deleteCustomer(selectedCustomer.id).unwrap();
      setShowDeleteCustomerConfirm(false);
      
      // Call parent handler if provided
      if (onDeleteCustomer) {
        onDeleteCustomer(selectedCustomer.id);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      setShowDeleteCustomerConfirm(false);
    }
  };

  // Handle edit customer
  const handleEditCustomer = () => {
    if (onEditCustomer && selectedCustomer) {
      onEditCustomer(selectedCustomer.id);
      setShowMoreActions(false);
    }
  };

  // Get appointment status info
  const getAppointmentStatusInfo = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Onaylandı' };
      case 'canceled':
        return { icon: FiXCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'İptal Edildi' };
      case 'completed':
        return { icon: FiCheckCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Tamamlandı' };
      default:
        return { icon: FiAlertCircle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Beklemede' };
    }
  };

  // Loading state
  if (isLoadingCustomer) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
            <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-600 font-medium">Müşteri bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (customerError) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg p-12 text-center">
        <Alert 
          type="error" 
          message="Müşteri bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin."
        />
      </div>
    );
  }

  if (!selectedCustomer) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg p-12 text-center">
        <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
          <FiUser className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">Müşteri Seçin</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          Detayları görüntülemek için sol taraftan bir müşteri seçin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg overflow-hidden">
        {/* Hero Section */}
        <div className="relative">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 px-8 py-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22https%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2210%22%20height%3D%2210%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2010%200%20L%200%200%200%2010%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.1)%22%20stroke-width%3D%220.5%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
            
            <div className="relative flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl">
                    <span className="text-white text-xl font-bold">
                      {getCustomerInitials(selectedCustomer)}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {formatCustomerName(selectedCustomer)}
                  </h1>
                  <div className="flex items-center space-x-4 text-indigo-100">
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{appointments.length} randevu</span>
                    </div>
                    <div className="flex items-center">
                      <FiStar className="w-4 h-4 mr-2" />
                      <span className="text-sm">Premium müşteri</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onCreateAppointment(selectedCustomer.id)}
                  className="inline-flex items-center px-5 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-200 shadow-lg"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Randevu Oluştur
                </button>
                
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    className="p-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-200"
                  >
                    <FiMoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showMoreActions && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-xl py-2 z-10">
                      <button 
                        onClick={handleEditCustomer}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100/80 flex items-center"
                      >
                        <FiEdit className="w-4 h-4 mr-3" />
                        Müşteriyi Düzenle
                      </button>
                      <button 
                        onClick={() => {
                          setShowDeleteCustomerConfirm(true);
                          setShowMoreActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50/80 flex items-center"
                      >
                        <FiTrash2 className="w-4 h-4 mr-3" />
                        Müşteriyi Sil
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={onClose}
                  className="p-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-200"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-200/60">
          <nav className="flex space-x-8">
            {[
              { id: 'info', label: 'Müşteri Bilgileri', icon: FiUser },
              { id: 'appointments', label: 'Randevular', icon: FiCalendar, badge: appointments.length },
              { id: 'history', label: 'Geçmiş', icon: FiActivity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative inline-flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                    <FiUser className="w-4 h-4 text-indigo-600" />
                  </div>
                  İletişim Bilgileri
                </h3>
                
                <div className="space-y-4">
                  <div className="group p-5 bg-gradient-to-r from-slate-50 to-white border border-slate-200/60 rounded-xl hover:shadow-md transition-all duration-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-4">
                        <FiUser className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ad Soyad</p>
                        <p className="text-base font-semibold text-slate-900">
                          {formatCustomerName(selectedCustomer)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedCustomer.email && (
                    <div className="group p-5 bg-gradient-to-r from-slate-50 to-white border border-slate-200/60 rounded-xl hover:shadow-md transition-all duration-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                          <FiMail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">E-posta</p>
                          <p className="text-base font-semibold text-slate-900">{selectedCustomer.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedCustomer.phoneNumber && (
                    <div className="group p-5 bg-gradient-to-r from-slate-50 to-white border border-slate-200/60 rounded-xl hover:shadow-md transition-all duration-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                          <FiPhone className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Telefon</p>
                          <p className="text-base font-semibold text-slate-900">{selectedCustomer.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info & Stats */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                    <FiActivity className="w-4 h-4 text-purple-600" />
                  </div>
                  Müşteri İstatistikleri
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/60 rounded-xl">
                    <div className="text-2xl font-bold text-indigo-600 mb-1">{appointments.length}</div>
                    <div className="text-sm font-medium text-indigo-700">Toplam Randevu</div>
                  </div>
                  
                  <div className="p-5 bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/60 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {appointments.filter(a => a.status === 'completed').length}
                    </div>
                    <div className="text-sm font-medium text-green-700">Tamamlanan</div>
                  </div>
                  
                  <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/60 rounded-xl">
                    <div className="text-2xl font-bold text-amber-600 mb-1">
                      {appointments.filter(a => a.status === 'confirmed').length}
                    </div>
                    <div className="text-sm font-medium text-amber-700">Yaklaşan</div>
                  </div>
                  
                  <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/60 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 mb-1">4.8</div>
                    <div className="text-sm font-medium text-purple-700">Memnuniyet</div>
                  </div>
                </div>

                {/* Notes */}
                {selectedCustomer.notes && (
                  <div className="mt-8">
                    <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                      <FiMessageSquare className="w-4 h-4 mr-2 text-slate-600" />
                      Notlar
                    </h4>
                    <div className="p-5 bg-gradient-to-r from-slate-50 to-white border border-slate-200/60 rounded-xl">
                      <p className="text-slate-700 leading-relaxed">{selectedCustomer.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <FiCalendar className="w-5 h-5 mr-3 text-indigo-600" />
                  Randevular
                </h3>
                <button
                  onClick={() => onCreateAppointment(selectedCustomer.id)}
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Yeni Randevu
                </button>
              </div>

              {isLoadingAppointments ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative mb-6">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
                  </div>
                  <p className="text-slate-600 font-medium">Randevular yükleniyor...</p>
                </div>
              ) : appointmentsError ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                    <FiCalendar className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Randevular yüklenemedi</h3>
                  <p className="text-slate-500 mb-6">Randevuları yüklerken bir hata oluştu.</p>
                  <button
                    onClick={() => refetchAppointments()}
                    className="inline-flex items-center px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all duration-200"
                  >
                    Tekrar Dene
                  </button>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                    <FiCalendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Randevu bulunamadı</h3>
                  <p className="text-slate-500 mb-6">Bu müşterinin henüz randevusu bulunmuyor.</p>
                  <button
                    onClick={() => onCreateAppointment(selectedCustomer.id)}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    İlk Randevuyu Oluştur
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {appointments.map((appointment) => {
                    const statusInfo = getAppointmentStatusInfo(appointment.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div
                        key={appointment.id}
                        className="group p-6 bg-white border border-slate-200/60 rounded-xl hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h4 className="text-lg font-semibold text-slate-900">{appointment.serviceName}</h4>
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                                <StatusIcon className="w-3 h-3 mr-1.5" />
                                {statusInfo.label}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 mb-4">
                              <div className="flex items-center">
                                <FiClock className="w-4 h-4 mr-2 text-slate-400" />
                                <span>
                                  {format(new Date(appointment.startTime), 'dd MMMM yyyy', { locale: tr })}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <FiClock className="w-4 h-4 mr-2 text-slate-400" />
                                <span>
                                  {format(new Date(appointment.startTime), 'HH:mm', { locale: tr })}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <FiTool className="w-4 h-4 mr-2 text-slate-400" />
                                <span>{appointment.employeeName || 'Personel atanmamış'}</span>
                              </div>
                            </div>
                            
                            {appointment.notes && (
                              <div className="p-3 bg-slate-50 rounded-lg mb-4">
                                <div className="flex items-start">
                                  <FiMessageSquare className="w-4 h-4 text-slate-400 mr-2 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-slate-600">{appointment.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => setShowDeleteConfirm(appointment.id)}
                              disabled={isDeletingAppointment || isCancellingAppointment}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                <FiActivity className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Geçmiş Yakında</h3>
              <p className="text-slate-500">Müşteri geçmişi özelliği yakında eklenecek.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Delete Appointment Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Randevuyu Sil</h3>
                <p className="text-sm text-slate-500">Bu işlem geri alınamaz</p>
              </div>
            </div>
            
            <p className="text-slate-600 mb-8">
              Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeletingAppointment}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDeleteAppointment(showDeleteConfirm)}
                disabled={isDeletingAppointment}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isDeletingAppointment ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Delete Customer Modal */}
      {showDeleteCustomerConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Müşteriyi Sil</h3>
                <p className="text-sm text-slate-500">Bu işlem geri alınamaz</p>
              </div>
            </div>
            
            <p className="text-slate-600 mb-8">
              <strong>{formatCustomerName(selectedCustomer)}</strong> isimli müşteriyi silmek istediğinizden emin misiniz? 
              Bu müşteriye ait tüm randevular da silinecektir.
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteCustomerConfirm(false)}
                disabled={isDeletingCustomer}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteCustomer}
                disabled={isDeletingCustomer}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isDeletingCustomer ? 'Siliniyor...' : 'Müşteriyi Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail; 