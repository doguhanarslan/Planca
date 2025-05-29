import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/tr'; // Import Turkish locale
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css'; // Import custom calendar styles
import { AppointmentDto } from '../../shared/types';
import { fetchAppointments, selectAppointments, selectCalendarDate, setCalendarDate } from './appointmentsSlice';
import { AppDispatch } from '../../app/store';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUser, FiTool, FiInfo, FiMoreHorizontal } from 'react-icons/fi';

// Set up Turkish locale for moment
moment.locale('tr');

// Setup localizer for the calendar
const localizer = momentLocalizer(moment);

interface AppointmentCalendarProps {
  onDateSelect: (date: Date) => void;
  timeFrame?: 'day' | 'week' | 'month'; // Added timeFrame prop
  onShowMore?: (date: Date) => void; // Add handler for "show more" events
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

const AppointmentCalendar = ({ onDateSelect, timeFrame = 'month', onShowMore }: AppointmentCalendarProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const appointments = useSelector(selectAppointments) || [];
  const selectedDate = useSelector(selectCalendarDate);
  
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const isInitialMount = useRef(true);
  
  // Map timeFrame to react-big-calendar view
  const calendarView = useMemo(() => {
    switch (timeFrame) {
      case 'day': return Views.DAY;
      case 'week': return Views.WEEK;
      case 'month': 
      default: return Views.MONTH;
    }
  }, [timeFrame]);
  
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
  
  // Fetch appointments only when component mounts or selectedDate changes intentionally
  useEffect(() => {
    // Skip the first render to prevent double fetch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      const currentDate = selectedDate ? new Date(selectedDate) : new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      try {
        dispatch(fetchAppointments({
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString()
        }));
      } catch (error) {
        console.error('Randevular yüklenirken hata:', error);
      }
      
      return;
    }
  }, [dispatch, selectedDate]); 
  
  // Handle date change in calendar - separate from automatic fetching
  const handleNavigate = (date: Date) => {
    // Only update calendar date without automatic fetch
    dispatch(setCalendarDate(date.toISOString()));
    
    // Manually fetch appointments for the new month
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    try {
      dispatch(fetchAppointments({
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString()
      }));
    } catch (error) {
      console.error('Takvimde gezinirken randevuları yüklerken hata:', error);
    }
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
  
  // Function to group appointments by date
  const getAppointmentsByDate = useCallback(() => {
    const appointmentsByDate: Record<string, AppointmentDto[]> = {};
    
    appointments.forEach((appointment: AppointmentDto) => {
      const dateKey = moment(appointment.startTime).format('YYYY-MM-DD');
      
      if (!appointmentsByDate[dateKey]) {
        appointmentsByDate[dateKey] = [];
      }
      
      appointmentsByDate[dateKey].push(appointment);
    });
    
    return appointmentsByDate;
  }, [appointments]);
  
  
  // Custom time slot wrapper for week/day views
  const TimeSlotWrapper = ({ children }: any) => (
    <div className="rbc-time-slot-modern">
      {children}
    </div>
  );

  // Custom toolbar component for the calendar - without view switchers
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
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="flex items-center px-4 py-1.5 rounded-full bg-white text-sm hover:bg-gray-50 transition-colors shadow-sm"
            aria-label="Today"
          >
            <FiCalendar className="mr-1.5" size={14} />
            Bugün
          </button>
          <button 
            type="button" 
            onClick={() => toolbar.onNavigate('NEXT')}
            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Next"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
        
        <div className="text-xl font-semibold text-gray-800">
          {toolbar.label}
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
    <div className="h-full w-full modern-calendar">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', width: '100%' }}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onNavigate={handleNavigate}
        formats={formats}
        view={calendarView}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        onShowMore={handleShowMore}
        components={{
          toolbar: CustomToolbar,
          event: EventComponent,
          timeSlotWrapper: TimeSlotWrapper
        }}
        // Customize max events per day
        popup
        messages={{
          showMore: (total) => `+${total} randevu`
        }}
      />
    </div>
  );
};

export default AppointmentCalendar; 