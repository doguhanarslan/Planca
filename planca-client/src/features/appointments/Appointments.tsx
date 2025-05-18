import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { FiCalendar, FiPlus, FiList, FiFilter } from 'react-icons/fi';
import AppointmentCalendar from './AppointmentCalendar';
import AppointmentList from './AppointmentList';
import AppointmentForm from './AppointmentForm';
import { clearAppointments, fetchAppointments, selectAppointments } from './appointmentsSlice';
import { AppDispatch } from '../../app/store';
import { AppointmentDto } from '../../types';

type ViewMode = 'calendar' | 'list';
type TimeFrame = 'day' | 'week' | 'month';

const Appointments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const appointments = useSelector(selectAppointments);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month'); // Varsayılan olarak ay görünümünü kullan
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentDto | null>(null);
  
  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowForm(true);
  };
  
  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setAppointmentToEdit(null);
  };
  
  // Handle successful appointment creation or update
  const handleAppointmentSuccess = () => {
    // Clear appointments in store to force refresh
    dispatch(clearAppointments());
    
    // Refresh appointments
    refreshAppointments();
    
    // Close the form
    handleFormClose();
  };
  
  // Handle appointment edit
  const handleEditAppointment = (appointment: AppointmentDto) => {
    setAppointmentToEdit(appointment);
    setSelectedDate(new Date(appointment.startTime));
    setShowForm(true);
  };
  
  // Refresh appointments based on current view
  const refreshAppointments = useCallback(() => {
    const today = selectedDate;
    let startDate: Date, endDate: Date;

    // Tüm görünümler için ay bazlı veri çekelim
    // Bu şekilde takvim ve liste görünümleri aynı veri kümesini kullanacak
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    
    console.log('Randevu verileri yükleniyor - Tarih aralığı:', {
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString()
    });

    dispatch(fetchAppointments({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }));
  }, [dispatch, selectedDate]);
  
  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Handle timeFrame change
  const handleTimeFrameChange = (frame: TimeFrame) => {
    setTimeFrame(frame);
  };

  // Load appointments on component mount and when selected date changes
  useEffect(() => {
    refreshAppointments();
    // Even when timeFrame changes, we'll use the same data but filter in the list component
  }, [refreshAppointments, selectedDate]);
  
  // Debug available appointments
  useEffect(() => {
    console.log('Appointments in main component:', appointments?.length);
  }, [appointments]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Title and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Randevular</h1>
          <p className="mt-1 text-gray-600">
            Randevularınızı ve programınızı yönetin
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <div className="inline-flex shadow-sm rounded-md">
            <button
              type="button"
              onClick={() => handleTimeFrameChange('day')}
              className={`px-4 py-2 text-sm font-medium ${
                timeFrame === 'day'
                  ? 'bg-red-600 text-white hover:bg-red-900'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } rounded-l-md shadow-sm duration-300 hover:cursor-pointer focus:z-10 focus:outline-none focus:ring-1`}
            >
              Gün
            </button>
            <button
              type="button"
              onClick={() => handleTimeFrameChange('week')}
              className={`px-4 py-2 text-sm font-medium ${
                timeFrame === 'week'
                  ? 'bg-red-600 text-white hover:bg-red-900'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } focus:z-10 shadow-sm hover:cursor-pointer focus:outline-none duration-300 focus:ring-1`}
            >
              Hafta
            </button>
            <button
              type="button"
              onClick={() => handleTimeFrameChange('month')}
              className={`px-4 py-2 text-sm font-medium ${
                timeFrame === 'month'
                  ? 'bg-red-600 text-white hover:bg-red-900'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } rounded-r-md shadow-sm hover:cursor-pointer focus:z-10 focus:outline-none duration-300`}
            >
              Ay
            </button>
          </div>
          
          <button
            className="flex items-center px-4 py-2 bg-red-600 font-bold text-white rounded-md hover:bg-red-900 focus:outline-none duration-300 hover:cursor-pointer shadow-lg"
            onClick={() => {
              setSelectedDate(new Date());
              setShowForm(true);
              setAppointmentToEdit(null);
            }}
          >
            <FiPlus className="mr-2" />
            Yeni Randevu
          </button>
        </div>
      </div>
      
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1 border">
          <button
            onClick={() => handleViewModeChange('calendar')}
            className={`flex items-center px-3 py-1.5 rounded-md ${
              viewMode === 'calendar'
                ? 'bg-primary-100 text-primary-800 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiCalendar className="mr-2" />
            Takvim
          </button>
          <button
            onClick={() => handleViewModeChange('list')}
            className={`flex items-center px-3 py-1.5 rounded-md ${
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-800 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiList className="mr-2" />
            Liste
          </button>
        </div>
        
        <div className="text-sm text-gray-600 font-medium">
          {format(selectedDate, 'MMMM yyyy')}
        </div>
      </div>
      
      {/* Debug Info */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="p-2 bg-blue-50 border border-blue-100 rounded-md text-xs mb-3">
          <strong>Hata Ayıklama:</strong> {appointments?.length || 0} randevu yüklendi
        </div>
      )}
      
      {/* Content based on selected view */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {viewMode === 'calendar' ? (
          <AppointmentCalendar onDateSelect={handleDateSelect} />
        ) : (
          <AppointmentList 
            viewMode={timeFrame}
            selectedDate={selectedDate}
            onEditAppointment={handleEditAppointment}
          />
        )}
      </div>
      
      {/* Appointment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <AppointmentForm 
              selectedDate={selectedDate} 
              onClose={handleFormClose} 
              onSuccess={handleAppointmentSuccess}
              appointmentToEdit={appointmentToEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments; 