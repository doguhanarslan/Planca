import { useState, useEffect, useMemo, MouseEvent } from 'react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FiClock, FiUser, FiTool, FiCalendar, FiX, FiEdit, FiCheckCircle, FiAlertCircle, FiTrash2, FiInfo } from 'react-icons/fi';
import { AppointmentDto } from '../../shared/types';
import LoadingSpinner from '../../shared/ui/components/LoadingSpinner';

// RTK Query hooks
import { 
  useGetAppointmentsQuery, 
  useDeleteAppointmentMutation 
} from './api/appointmentsAPI';

interface AppointmentListProps {
  viewMode?: 'day' | 'week' | 'month';
  selectedDate?: Date;
  onEditAppointment?: (appointment: AppointmentDto) => void;
  appointments?: AppointmentDto[]; // Add prop for pre-filtered appointments
  searchQuery?: string; // Add search query prop
}

const AppointmentList = ({ 
  viewMode = 'week', 
  selectedDate = new Date(), 
  onEditAppointment,
  appointments: propAppointments,
  searchQuery = '' 
}: AppointmentListProps) => {
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentDto[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // RTK Query for appointments (only if not provided via props)
  const {
    data: queryAppointments = [],
    isLoading,
    error,
    refetch,
  } = useGetAppointmentsQuery(
    {
      // For month view, get appointments for the entire month
      startDate: !propAppointments ? (() => {
        const date = selectedDate;
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        return startOfMonth.toISOString();
      })() : undefined,
      endDate: !propAppointments ? (() => {
        const date = selectedDate;
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        return endOfMonth.toISOString();
      })() : undefined,
      pageSize: 100, // Get more appointments for list view
      sortBy: 'StartTime',
      sortDirection: 'asc',
    },
    {
      // Skip query if appointments are provided via props
      skip: Boolean(propAppointments),
      // Refetch on mount and when appointments cache changes
      refetchOnMountOrArgChange: true,
      // Refetch on window focus
      refetchOnFocus: true,
      // Reduce polling interval for better real-time updates (every 10 seconds)
      pollingInterval: 10000,
    }
  );

  // RTK Query mutation for deleting appointments
  const [deleteAppointment, { 
    isLoading: isDeleting 
  }] = useDeleteAppointmentMutation();

  // Use either provided appointments or query results
  const appointments = useMemo(() => {
    if (propAppointments) {
      return propAppointments;
    }
    
    // Handle different response formats from RTK Query
    if (Array.isArray(queryAppointments)) {
      return queryAppointments;
    } else if (queryAppointments && 'items' in queryAppointments) {
      return queryAppointments.items || [];
    } else {
      return [];
    }
  }, [propAppointments, queryAppointments]);

  // Filter appointments based on date range and search term
  useEffect(() => {
    if (!appointments) {
      setFilteredAppointments([]);
      return;
    }
    
    console.log(`AppointmentList: filtering ${appointments.length} appointments for ${viewMode} view`);
    
    // First filter by date range based on viewMode
    let dateFilteredAppointments = [...appointments];
    
    // Apply date filtering based on viewMode (only if not using propAppointments)
    if (viewMode !== 'month' && !propAppointments) {
      const today = selectedDate;
      let startDate: Date, endDate: Date;
      
      switch (viewMode) {
        case 'day':
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
          break;
        case 'week':
        default: {
          // Get first day of week (Sunday)
          const dayOfWeek = today.getDay();
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59);
        }
      }
      
      console.log('Filtering appointments for date range:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      // Filter appointments that fall within the date range
      dateFilteredAppointments = appointments.filter((appointment: AppointmentDto) => {
        if (!appointment.startTime) return false;
        
        const appointmentDate = new Date(appointment.startTime);
        return isWithinInterval(appointmentDate, { start: startDate, end: endDate });
      });
      
      console.log(`Date filtered appointments: ${dateFilteredAppointments.length}`);
    }
    
    // Then apply search filter if needed
    if (searchQuery.trim() === '') {
      setFilteredAppointments(dateFilteredAppointments);
    } else {
      const normalizedSearchTerm = searchQuery.toLowerCase().trim();
      const searchFiltered = dateFilteredAppointments.filter((appointment: AppointmentDto) => 
        (appointment.customerName && appointment.customerName.toLowerCase().includes(normalizedSearchTerm)) ||
        (appointment.serviceName && appointment.serviceName.toLowerCase().includes(normalizedSearchTerm)) ||
        (appointment.employeeName && appointment.employeeName.toLowerCase().includes(normalizedSearchTerm))
      );
      
      setFilteredAppointments(searchFiltered);
    }
  }, [appointments, viewMode, selectedDate, searchQuery, propAppointments]);

  // Group appointments by date
  const { groupedAppointments, sortedDates } = useMemo(() => {
    const grouped: Record<string, AppointmentDto[]> = {};
    
    try {
      filteredAppointments.forEach((appointment) => {
        if (!appointment.startTime) {
          console.warn('Missing startTime in appointment:', appointment);
          return;
        }
        
        try {
          const date = format(parseISO(appointment.startTime), 'yyyy-MM-dd');
          if (!grouped[date]) {
            grouped[date] = [];
          }
          grouped[date].push(appointment);
        } catch (err) {
          console.error('Error processing appointment:', appointment, err);
        }
      });
    } catch (err) {
      console.error('Error grouping appointments:', err);
    }

    const sorted = Object.keys(grouped).sort();
    
    return {
      groupedAppointments: grouped,
      sortedDates: sorted,
    };
  }, [filteredAppointments]);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let color = 'bg-gray-200 text-gray-800';
    let icon = <FiClock />;

    switch (status.toLowerCase()) {
      case 'confirmed':
        color = 'bg-green-100 text-green-800';
        icon = <FiCheckCircle />;
        break;
      case 'canceled':
        color = 'bg-red-100 text-red-800';
        icon = <FiX />;
        break;
      case 'pending':
        color = 'bg-yellow-100 text-yellow-800';
        icon = <FiAlertCircle />;
        break;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} border border-current border-opacity-20 shadow-sm`}>
        <span className="mr-1">{icon}</span>
        {status === 'confirmed' ? 'Onaylandı' : 
         status === 'canceled' ? 'İptal Edildi' : 
         status === 'pending' ? 'Beklemede' : status}
      </span>
    );
  };
  
  console.log('AppointmentList render - Loading:', isLoading);
  console.log('AppointmentList render - filteredAppointments:', filteredAppointments.length);

  // Handle delete appointment
  const handleDeleteClick = (e: MouseEvent, appointmentId: string) => {
    e.stopPropagation();
    setShowDeleteConfirm(appointmentId);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        console.log('🗑️ Deleting appointment:', showDeleteConfirm);
        
        // Optimistic UI update - remove from local state immediately
        setFilteredAppointments(prev => prev.filter(apt => apt.id !== showDeleteConfirm));
        
        await deleteAppointment(showDeleteConfirm).unwrap();
        setShowDeleteConfirm(null);
        
        // Force immediate refetch with bypass cache for better UX
        if (!propAppointments && refetch) {
          console.log('🔄 Force refetching appointments after delete with cache bypass');
          // Trigger a new query with bypass cache
          refetch();
        }
        
        console.log('✅ Appointment deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting appointment:', error);
        // Revert optimistic update on error by refetching
        if (!propAppointments && refetch) {
          refetch();
        }
        // Show user-friendly error message
        alert('Randevu silinirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  // Show loading spinner only if we're loading and have no appointments
  if (isLoading && appointments.length === 0) {
    return (
      <div className="p-16">
        <LoadingSpinner text="Randevular yükleniyor..." />
      </div>
    );
  }

  // Show error if there's an error and no cached data
  if (error && appointments.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <FiCalendar size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Randevular yüklenemedi</h3>
        <p className="text-gray-500 mb-4">
          Randevuları yüklerken bir hata oluştu.
        </p>
        {!propAppointments && (
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Tekrar Dene
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden">
      {/* Loading indicator for background refetching */}
      {isLoading && appointments.length > 0 && (
        <div className="p-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center text-blue-700 text-sm">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span>Randevular güncelleniyor...</span>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {filteredAppointments.length === 0 && !isLoading && (
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiCalendar size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">Randevu bulunamadı</h3>
          <p className="text-gray-500 text-sm mb-4">
            {searchQuery ? 'Arama kriterlerine uygun randevu bulunamadı.' : 'Bu zaman dilimi için randevu bulunmuyor.'}
          </p>
          {searchQuery && (
            <p className="text-gray-500 text-sm">
              Arama terimini değiştirmeyi deneyin veya yeni bir randevu oluşturun.
            </p>
          )}
        </div>
      )}
      
      {/* Appointment List */}
      {filteredAppointments.length > 0 && (
        <div>
          {sortedDates.map(date => (
            <div key={date} className="mb-4 last:mb-0">
              <div className="bg-gray-50 px-5 py-3 font-medium text-gray-800 flex items-center justify-between rounded-lg mb-2 shadow-sm">
                <div className="flex items-center">
                  <FiCalendar className="mr-2 text-red-500" />
                  {format(parseISO(date), 'EEEE, d MMMM yyyy', { locale: tr })}
                </div>
                <div className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full shadow-sm">
                  {groupedAppointments[date].length} randevu
                </div>
              </div>
              <div className="space-y-2 px-1">
                {groupedAppointments[date]
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                    >
                      <div className="px-5 py-4 sm:flex sm:justify-between rounded-md">
                        <div className="mb-3 sm:mb-0">
                          <div className="flex items-center space-x-2 mb-1.5">
                            <span className="font-medium text-gray-900">{appointment.customerName || 'Müşteri'}</span>
                            <StatusBadge status={appointment.status || 'pending'} />
                          </div>
                          
                          <div className="mt-2 flex flex-col space-y-1.5 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FiTool className="mr-2 text-red-500" />
                              <span>{appointment.serviceName || 'Hizmet'}</span>
                            </div>
                            <div className="flex items-center">
                              <FiUser className="mr-2 text-red-500" />
                              <span>{appointment.employeeName || 'Personel bilgisi yok'}</span>
                            </div>
                            {appointment.notes && (
                              <div className="flex items-start max-w-md">
                                <FiInfo className="mr-2 text-red-500 mt-0.5" />
                                <span className="text-gray-500 text-xs line-clamp-1">{appointment.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="sm:flex sm:flex-col sm:items-end">
                          <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-50 px-3.5 py-1.5 rounded-full shadow-sm mb-3">
                            <FiClock className="mr-1.5 text-red-500" />
                            <time dateTime={appointment.startTime}>
                              {format(parseISO(appointment.startTime), 'HH:mm')} - 
                              {appointment.endTime ? format(parseISO(appointment.endTime), ' HH:mm') : ''}
                            </time>
                          </div>
                          
                          <div className="flex space-x-2">
                            {onEditAppointment && (
                              <button
                                onClick={() => onEditAppointment(appointment)}
                                className="inline-flex items-center px-3.5 py-1.5 shadow-sm text-xs leading-4 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
                                disabled={isDeleting}
                              >
                                <FiEdit className="mr-1.5" size={14} />
                                Düzenle
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteClick(e, appointment.id)}
                              className="inline-flex items-center px-3.5 py-1.5 shadow-sm text-xs leading-4 font-medium rounded-full text-red-600 bg-white hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors"
                              disabled={isDeleting}
                            >
                              <FiTrash2 className="mr-1.5" size={14} />
                              {isDeleting && showDeleteConfirm === appointment.id ? 'Siliniyor...' : 'Sil'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

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
                className="px-4 py-2 rounded-full shadow-sm text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 rounded-full shadow-sm text-white hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;