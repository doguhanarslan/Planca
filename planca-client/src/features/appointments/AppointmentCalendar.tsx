import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { AppointmentDto } from '../../types';
import { fetchAppointments, selectAppointments, selectCalendarDate, setCalendarDate } from './appointmentsSlice';
import { AppDispatch } from '../../app/store';

// Setup localizer for the calendar
const localizer = momentLocalizer(moment);

interface AppointmentCalendarProps {
  onDateSelect: (date: Date) => void;
}

const AppointmentCalendar = ({ onDateSelect }: AppointmentCalendarProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const appointments = useSelector(selectAppointments) || [];
  const selectedDate = useSelector(selectCalendarDate);
  
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const isInitialMount = useRef(true);
  
  // Convert appointments to calendar events
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const events = appointments.map((appointment: AppointmentDto) => ({
        id: appointment.id,
        title: `${appointment.customerName || 'Customer'} - ${appointment.serviceName || 'Service'}`,
        start: new Date(appointment.startTime),
        end: new Date(appointment.endTime),
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
        console.error('Error fetching appointments:', error);
      }
      
      return;
    }
  }, [dispatch]); // Only depend on dispatch
  
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
      console.error('Error fetching appointments on navigate:', error);
    }
  };
  
  // Handle date selection in calendar
  const handleSelectSlot = ({ start }: { start: Date }) => {
    onDateSelect(start);
  };
  
  // Custom toolbar component for the calendar
  const CustomToolbar = (toolbar: any) => {
    const goToToday = () => {
      const today = new Date();
      toolbar.onNavigate('TODAY', today);
    };
    
    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={() => toolbar.onNavigate('PREV')}>
            &lt;
          </button>
          <button type="button" onClick={goToToday}>
            Today
          </button>
          <button type="button" onClick={() => toolbar.onNavigate('NEXT')}>
            &gt;
          </button>
        </span>
        <span className="rbc-toolbar-label">{toolbar.label}</span>
        <span className="rbc-btn-group">
          <button 
            type="button" 
            className={toolbar.view === 'month' ? 'rbc-active' : ''}
            onClick={() => toolbar.onView('month')}
          >
            Month
          </button>
          <button 
            type="button" 
            className={toolbar.view === 'week' ? 'rbc-active' : ''}
            onClick={() => toolbar.onView('week')}
          >
            Week
          </button>
          <button 
            type="button" 
            className={toolbar.view === 'day' ? 'rbc-active' : ''}
            onClick={() => toolbar.onView('day')}
          >
            Day
          </button>
        </span>
      </div>
    );
  };

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        selectable={true}
        onSelectSlot={handleSelectSlot}
        onNavigate={handleNavigate}
        components={{
          toolbar: CustomToolbar
        }}
      />
    </div>
  );
};

export default AppointmentCalendar; 