import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { FiClock, FiUser, FiTool, FiCalendar, FiX, FiEdit, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { selectAppointments, selectAppointmentsStatus } from './appointmentsSlice';
import { RootState } from '../../app/store';
import { AppointmentDto } from '../../types';

interface AppointmentListProps {
  viewMode?: 'day' | 'week' | 'month';
  selectedDate?: Date;
  onEditAppointment?: (appointment: AppointmentDto) => void;
}

const AppointmentList = ({ viewMode = 'week', selectedDate = new Date(), onEditAppointment }: AppointmentListProps) => {
  const appointments = useSelector(selectAppointments);
  const status = useSelector(selectAppointmentsStatus);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter appointments based on date range and search term
  useEffect(() => {
    if (!appointments) {
      setFilteredAppointments([]);
      return;
    }
    
    console.log(`AppointmentList: filtering ${appointments.length} appointments for ${viewMode} view`);
    
    // First filter by date range based on viewMode
    let dateFilteredAppointments = [...appointments];
    
    // Apply date filtering based on viewMode
    if (viewMode !== 'month') {
      const today = selectedDate;
      let startDate: Date, endDate: Date;
      
      switch (viewMode) {
        case 'day':
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
          break;
        case 'week':
        default:
          // Get first day of week (Sunday)
          const dayOfWeek = today.getDay();
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59);
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
    if (searchTerm.trim() === '') {
      setFilteredAppointments(dateFilteredAppointments);
    } else {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      const searchFiltered = dateFilteredAppointments.filter((appointment: AppointmentDto) => 
        (appointment.customerName && appointment.customerName.toLowerCase().includes(normalizedSearchTerm)) ||
        (appointment.serviceName && appointment.serviceName.toLowerCase().includes(normalizedSearchTerm)) ||
        (appointment.employeeName && appointment.employeeName.toLowerCase().includes(normalizedSearchTerm))
      );
      
      setFilteredAppointments(searchFiltered);
    }
  }, [appointments, viewMode, selectedDate, searchTerm]);

  // Debug groupedAppointments calculation
  let groupedAppointments: Record<string, AppointmentDto[]> = {};
  let sortedDates: string[] = [];
  
  try {
    // Group appointments by date
    groupedAppointments = filteredAppointments.reduce((acc, appointment) => {
      try {
        if (!appointment.startTime) {
          console.warn('Missing startTime in appointment:', appointment);
          return acc;
        }
        
        const date = format(parseISO(appointment.startTime), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(appointment);
      } catch (err) {
        console.error('Error processing appointment:', appointment, err);
      }
      return acc;
    }, {} as Record<string, AppointmentDto[]>);

    // Sort dates
    sortedDates = Object.keys(groupedAppointments).sort();
  } catch (err) {
    console.error('Error grouping appointments:', err);
  }

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
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  console.log('AppointmentList render - Status:', status);
  console.log('AppointmentList render - filteredAppointments:', filteredAppointments.length);

  if (status === 'loading' && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Randevularda ara..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="p-3 bg-blue-50 border-b border-blue-100 text-xs">
          <div><strong>Debug:</strong> Status: {status} | Found: {appointments?.length} appointments</div>
          <div>Filtered: {filteredAppointments?.length} | Grouped dates: {sortedDates?.length}</div>
        </div>
      )}

      {filteredAppointments.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FiCalendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Randevu bulunamadı</p>
          <p className="text-sm">Arama kriterlerinizi veya tarih aralığını değiştirmeyi deneyin</p>
        </div>
      ) : (
        <div>
          {sortedDates.map(date => (
            <div key={date} className="border-b last:border-b-0">
              <div className="bg-gray-50 px-4 py-3 font-medium text-primary-700 border-l-4 border-primary-500 flex items-center">
                <FiCalendar className="mr-2" />
                {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
              </div>
              <ul>
                {groupedAppointments[date]
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .map((appointment) => (
                    <li key={appointment.id} className="border-b last:border-b-0">
                      <div className="px-4 py-3 hover:bg-gray-50 sm:flex sm:justify-between rounded-md transition-colors duration-150">
                        <div className="mb-2 sm:mb-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 text-base">{appointment.customerName || 'Customer'}</span>
                            <span>
                              <StatusBadge status={appointment.status || 'pending'} />
                            </span>
                          </div>
                          
                          <div className="mt-2 flex flex-col space-y-1.5 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FiTool className="mr-2 text-primary-500" />
                              <span className="font-medium">{appointment.serviceName || 'Service'}</span>
                            </div>
                            <div className="flex items-center">
                              <FiUser className="mr-2 text-primary-500" />
                              <span className="font-medium">{appointment.employeeName || 'Personel bilgisi yok'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="sm:flex sm:flex-col sm:items-end mt-2 sm:mt-0">
                          <div className="flex items-center text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                            <FiClock className="mr-1.5 text-primary-500" />
                            <time dateTime={appointment.startTime}>
                              {format(parseISO(appointment.startTime), 'h:mm a')} - 
                              {appointment.endTime ? format(parseISO(appointment.endTime), ' h:mm a') : ''}
                            </time>
                          </div>
                          
                          {onEditAppointment && (
                            <button
                              onClick={() => onEditAppointment(appointment)}
                              className="mt-3 inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:text-primary-600 focus:outline-none focus:border-primary-300 focus:ring focus:ring-primary-200 active:text-gray-800 active:bg-gray-50 transition-colors duration-150"
                            >
                              <FiEdit className="mr-1.5" size={14} />
                              Düzenle
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList; 