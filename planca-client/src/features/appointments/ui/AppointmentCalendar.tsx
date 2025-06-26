import { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/tr'; // Import Turkish locale
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../calendar-styles.css'; // Import custom calendar styles
import { AppointmentDto } from '../../../shared/types';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUser, FiTool, FiInfo } from 'react-icons/fi';

// RTK Query hooks
import { useGetAppointmentsQuery } from '../api/appointmentsAPI';

// Set up Turkish locale for moment
moment.locale('tr');

// Setup localizer for the calendar
const localizer = momentLocalizer(moment);

interface AppointmentCalendarProps {
  selectedDate: Date;
  currentCalendarMonth: Date;
  onMonthChange: (date: Date) => void;
  disabled: boolean;
  onDateSelect: (date: Date) => void;
  timeFrame?: 'day' | 'week' | 'month'; // Added timeFrame prop
  onShowMore?: (date: Date) => void; // Add handler for "show more" events
  refreshTrigger?: number; // Add refresh trigger prop
}

// Define event colors based on status
const getEventStyles = (appointment: AppointmentDto) => {
  const status = appointment?.status?.toLowerCase();
  
  switch (status) {
    case 'confirmed':
      return {
        className: 'bg-green-500 border-green-600',
        icon: <span className="inline-block w-2 h-2 rounded-full bg-green-300 mr-1"></span>
      };
    case 'canceled':
      return {
        className: 'bg-red-400 border-red-500',
        icon: <span className="inline-block w-2 h-2 rounded-full bg-red-300 mr-1"></span>
      };
    case 'pending':
      return {
        className: 'bg-yellow-400 border-yellow-500',
        icon: <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 mr-1"></span>
      };
    default:
      return {
        className: 'bg-white border-red-500',
        icon: <span className="inline-block w-2 h-2 rounded-full bg-red-300 mr-1"></span>
      };
  }
};

const AppointmentCalendar = ({ 
  selectedDate, 
  currentCalendarMonth,
  onMonthChange,
  onDateSelect, 
  timeFrame = 'month', 
  onShowMore,
  refreshTrigger
}: AppointmentCalendarProps) => {
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(currentCalendarMonth || new Date());
  
  // Sync currentDate with parent's currentCalendarMonth
  useEffect(() => {
    if (currentCalendarMonth) {
      setCurrentDate(currentCalendarMonth);
    }
  }, [currentCalendarMonth]);
  
  // Map timeFrame to react-big-calendar view
  const calendarView = useMemo(() => {
    switch (timeFrame) {
      case 'day': return Views.DAY;
      case 'week': return Views.WEEK;
      case 'month': 
      default: return Views.MONTH;
    }
  }, [timeFrame]);
  
  // Calculate date range for RTK Query based on current calendar view
  const { startDate, endDate } = useMemo(() => {
    const date = currentDate;
    let start: Date, end: Date;
    
    switch (timeFrame) {
      case 'day':
        start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        break;
      case 'week':
        const dayOfWeek = date.getDay();
        start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfWeek);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59);
        break;
      case 'month':
      default:
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        break;
    }
    
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [currentDate, timeFrame]);
  
  // RTK Query to fetch appointments
  const {
    data: appointmentsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useGetAppointmentsQuery(
    {
      startDate,
      endDate,
      pageSize: 100, // Get more appointments for calendar view
      sortBy: 'StartTime',
      sortDirection: 'asc',
    },
    {
      // Always refetch when component mounts or data changes
      refetchOnMountOrArgChange: true,
      // Refetch on window focus
      refetchOnFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Enable polling for real-time updates
      pollingInterval: 60000, // Poll every minute for better performance and cache usage
    }
  );
  
  // Refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && refetch) {
      console.log('Calendar refreshTrigger fired, refetching appointments...');
      refetch();
    }
  }, [refreshTrigger, refetch]);
  
  // Process appointments data
  const appointments = useMemo(() => {
    console.log('Calendar processing appointments data:', appointmentsData);
    
    if (!appointmentsData) return [];
    
    // Handle different response formats
    if (Array.isArray(appointmentsData)) {
      return appointmentsData;
    } else if ('items' in appointmentsData) {
      return appointmentsData.items || [];
    } else {
      return [];
    }
  }, [appointmentsData]);
  
  // Convert appointments to calendar events
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const events = appointments.map((appointment: AppointmentDto) => ({
        id: appointment.id,
        title: `${appointment.customerName || 'Müşteri'} - ${appointment.serviceName || 'Hizmet'}`,
        start: new Date(appointment.startTime),
        end: appointment.endTime ? new Date(appointment.endTime) : new Date(new Date(appointment.startTime).getTime() + 30 * 60000), // Default 30min
        resource: appointment
      }));
      
      setCalendarEvents(events);
    } else {
      setCalendarEvents([]);
    }
  }, [appointments]);
  
  // Handle date change in calendar
  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
    onMonthChange(date);
  };
  
  // Handle date selection in calendar
  const handleSelectSlot = ({ start }: { start: Date }) => {
    onDateSelect(start);
  };

  // Custom event component with hover info
  const EventComponent = ({ event }: { event: any }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const appointment = event.resource;
    const { className, icon } = getEventStyles(appointment);
    
    return (
      <div 
        className={`rounded-lg shadow overflow-hidden border-l-4 ${className} ${className.includes('bg-white') ? 'text-gray-700' : 'text-white'} backdrop-blur-sm hover:scale-[1.02] transition-transform relative w-full`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="font-medium text-xs truncate flex items-center w-full px-2 py-1">
          {icon}
          {event.title}
        </div>
        <div className="text-xs opacity-90 truncate flex items-center w-full px-2 pb-1">
          <FiClock className="mr-1 flex-shrink-0" size={10} />
          {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
        </div>
        
        {/* Event tooltip/hover info */}
        {showTooltip && (
          <div className="absolute z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200 text-gray-800 w-64 -translate-y-full left-0 ml-2 -mt-2">
            <div className="text-sm font-semibold mb-2 border-b pb-1 flex items-center">
              {icon}
              {appointment.customerName || 'Müşteri'}
            </div>
            <div className="text-xs space-y-1.5">
              <div className="flex items-center">
                <FiTool className="mr-2 text-gray-400" size={12} />
                <span>{appointment.serviceName || 'Hizmet'}</span>
              </div>
              <div className="flex items-center">
                <FiUser className="mr-2 text-gray-400" size={12} />
                <span>{appointment.employeeName || 'Personel atanmamış'}</span>
              </div>
              <div className="flex items-center">
                <FiClock className="mr-2 text-gray-400" size={12} />
                <span>
                  {moment(event.start).format('DD MMM, HH:mm')} - {moment(event.end).format('HH:mm')}
                </span>
              </div>
              {appointment.notes && (
                <div className="flex items-start mt-1 pt-1 border-t border-gray-100">
                  <FiInfo className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" size={12} />
                  <span className="text-gray-600 break-words">{appointment.notes}</span>
                </div>
              )}
            </div>
            {/* Triangle pointer */}
            <div className="absolute h-2 w-2 bg-white transform rotate-45 bottom-0 left-3 translate-y-1 border-r border-b border-gray-200"></div>
          </div>
        )}
      </div>
    );
  };
  
  // Custom time slot wrapper for week/day views
  const TimeSlotWrapper = ({ children }: any) => (
    <div className="rbc-time-slot-modern">
      {children}
    </div>
  );

  // Custom toolbar component for the calendar
  const CustomToolbar = (toolbar: any) => {
    const goToToday = () => {
      const today = new Date();
      toolbar.onNavigate('TODAY', today);
    };
    
    return (
      <div className="flex flex-wrap justify-between items-center py-4 px-6">
        <div className="flex items-center space-x-2">
          <button 
            type="button" 
            onClick={() => toolbar.onNavigate('PREV')}
            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Previous"
            disabled={isLoading}
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="flex items-center px-4 py-1.5 rounded-full bg-white text-sm hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Today"
            disabled={isLoading}
          >
            <FiCalendar className="mr-1.5" size={14} />
            Bugün
          </button>
          <button 
            type="button" 
            onClick={() => toolbar.onNavigate('NEXT')}
            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Next"
            disabled={isLoading}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          {isLoading && (
            <div className="flex items-center text-blue-600 text-sm">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Yükleniyor...</span>
            </div>
          )}
          
          {error && (
            <button
              onClick={() => refetch()}
              className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
            >
              <span>Hata - Tekrar dene</span>
            </button>
          )}
          
          <div className="text-xl font-semibold text-gray-800">
            {toolbar.label}
          </div>
        </div>
      </div>
    );
  };

  // Calendar formats customization
  const formats = useMemo(() => ({
    monthHeaderFormat: 'MMMM YYYY',
    dayHeaderFormat: 'dddd DD MMMM',
    dayRangeHeaderFormat: ({ start, end }: { start: Date, end: Date }) => 
      `${moment(start).format('DD MMMM')} - ${moment(end).format('DD MMMM YYYY')}`,
    timeGutterFormat: 'HH:mm',
  }), []);

  // Handle showing more events for a specific date
  const handleShowMore = useCallback((events: any[], date: Date) => {
    if (onShowMore) {
      onShowMore(date);
    }
  }, [onShowMore]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg overflow-hidden">
      {/* Modern Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <FiCalendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Randevu Takvimi</h2>
              <p className="text-sm text-slate-500">
                {appointments.length} randevu • {timeFrame === 'month' ? 'Aylık' : timeFrame === 'week' ? 'Haftalık' : 'Günlük'} görünüm
              </p>
            </div>
            {(isFetching || isLoading) && (
              <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-xs font-medium">Güncelleniyor</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleNavigate(new Date())}
              className="inline-flex items-center px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-sm rounded-xl transition-all duration-200"
            >
              <FiCalendar className="w-4 h-4 mr-2" />
              Bugün
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2 text-red-700">
              <FiInfo className="w-4 h-4" />
              <span className="text-sm font-medium">Randevular yüklenirken bir hata oluştu. Lütfen tekrar deneyin.</span>
            </div>
          </div>
        )}
        
        <div className="calendar-container rounded-xl overflow-hidden border border-slate-200/60" style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onNavigate={handleNavigate}
            onSelectSlot={handleSelectSlot}
            selectable={true}
            view={calendarView}
            onView={() => {}} // Prevent view changes from calendar itself
            date={currentDate}
            culture="tr"
            messages={{
              next: 'Sonraki',
              previous: 'Önceki',
              today: 'Bugün',
              month: 'Ay',
              week: 'Hafta',
              day: 'Gün',
              agenda: 'Ajanda',
              date: 'Tarih',
              time: 'Saat',
              event: 'Randevu',
              allDay: 'Tüm Gün',
              noEventsInRange: 'Bu tarih aralığında randevu bulunmuyor.',
              showMore: (total: number) => `+${total} daha fazla`
            }}
            formats={{
              dayFormat: 'dd',
              weekdayFormat: 'dddd',
              monthHeaderFormat: 'MMMM YYYY',
              dayHeaderFormat: 'dddd D MMMM',
              dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                localizer?.format(start, 'D MMMM', culture) + ' - ' + localizer?.format(end, 'D MMMM YYYY', culture)
            }}
            components={{
              event: EventComponent,
              toolbar: CustomToolbar,
              timeSlotWrapper: TimeSlotWrapper,
            }}
            eventPropGetter={(event) => {
              const appointment = event.resource as AppointmentDto;
              const { className } = getEventStyles(appointment);
              
              return {
                className: `calendar-event ${className}`,
                style: {
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  padding: '4px 8px',
                }
              };
            }}
            dayPropGetter={(date) => {
              const isToday = moment(date).isSame(moment(), 'day');
              const isSelected = moment(date).isSame(moment(selectedDate), 'day');
              
              return {
                className: `${isToday ? 'today-cell' : ''} ${isSelected ? 'selected-cell' : ''}`,
                style: {
                  backgroundColor: isToday ? '#fef2f2' : isSelected ? '#fee2e2' : undefined,
                }
              };
            }}
            onShowMore={(events, date) => {
              if (onShowMore) {
                onShowMore(date);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;