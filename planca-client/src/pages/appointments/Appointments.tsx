import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { FiCalendar, FiPlus, FiList, FiGrid, FiClock, FiChevronLeft, FiChevronRight, FiFilter, FiSearch } from 'react-icons/fi';
import AppointmentCalendar from '@/features/appointments/ui/AppointmentCalendar';
import AppointmentList from '@/features/appointments/AppointmentList';
import AppointmentForm from '@/features/appointments/ui/AppointmentForm';
import { clearAppointments, fetchAppointments, selectAppointments } from '@/features/appointments/appointmentsSlice';
import { AppDispatch } from '../../app/store';
import { AppointmentDto } from '../../shared/types';

type ViewMode = 'calendar' | 'list';
type TimeFrame = 'day' | 'week' | 'month';

const Appointments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const appointments = useSelector(selectAppointments);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentDto | null>(null);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
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
  
  // Handle show more event click from calendar
  const handleShowMore = (date: Date) => {
    setFilterDate(date);
    setViewMode('list');
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
    if (mode === 'calendar') {
      setFilterDate(null); // Reset filter date when switching to calendar view
    }
  };

  // Handle time frame change
  const handleTimeFrameChange = (frame: TimeFrame) => {
    setTimeFrame(frame);
  };
  
  // Clear date filter
  const clearDateFilter = () => {
    setFilterDate(null);
  };
  
  // Load appointments on component mount and when selected date changes
  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments, selectedDate]);
  
  // Filter appointments if filterDate is set
  const filteredAppointments = filterDate
    ? appointments?.filter((appointment: AppointmentDto) => 
        appointment.startTime && 
        isSameDay(new Date(appointment.startTime), filterDate)
      )
    : appointments;

  return (
    <div className="flex flex-col h-full">
      {/* Main Content Area with Enhanced Calendar Size */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="max-w-screen-2xl w-full mx-auto px-2 py-4 sm:px-4 lg:px-6">
          {/* View Mode and Time Frame Controls */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:justify-between mb-4">
            {/* View Mode Controls */}
            <div className="inline-flex bg-white rounded-full shadow-md p-1">
              <button
                onClick={() => handleViewModeChange('calendar')}
                className={`flex items-center px-4 py-1.5 text-sm rounded-full ${
                  viewMode === 'calendar'
                    ? 'bg-gray-100 font-medium text-gray-800 shadow-inner'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
              >
                <FiGrid className="mr-1.5" size={16} />
                Takvim
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`flex items-center px-4 py-1.5 text-sm rounded-full ${
                  viewMode === 'list'
                    ? 'bg-gray-100 font-medium text-gray-800 shadow-inner'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
              >
                <FiList className="mr-1.5" size={16} />
                Liste
              </button>
            </div>

            {/* Time Frame Controls */}
            <div className="inline-flex bg-white rounded-full shadow-md p-1">
              <button
                onClick={() => handleTimeFrameChange('day')}
                className={`flex items-center px-4 py-1.5 text-sm rounded-full ${
                  timeFrame === 'day'
                    ? 'bg-red-50 font-medium text-red-600 shadow-inner'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
              >
                <FiClock className="mr-1.5" size={15} />
                Gün
              </button>
              <button
                onClick={() => handleTimeFrameChange('week')}
                className={`flex items-center px-4 py-1.5 text-sm rounded-full ${
                  timeFrame === 'week'
                    ? 'bg-red-50 font-medium text-red-600 shadow-inner'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
              >
                Hafta
              </button>
              <button
                onClick={() => handleTimeFrameChange('month')}
                className={`flex items-center px-4 py-1.5 text-sm rounded-full ${
                  timeFrame === 'month'
                    ? 'bg-red-50 font-medium text-red-600 shadow-inner'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
              >
                Ay
              </button>
            </div>
            
            {/* Action Buttons - moved from top bar */}
            <div className="flex space-x-2 items-center">
              {viewMode === 'list' && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-50 rounded-full pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all w-32 focus:w-40 shadow-sm"
                  />
                  <FiSearch className="absolute left-3 top-2 text-gray-400" size={15} />
                </div>
              )}
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiFilter size={18} />
              </button>
              
              <button
                className="flex items-center px-3.5 py-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-300 font-bold text-sm shadow-md"
                onClick={() => {
                  setSelectedDate(new Date());
                  setShowForm(true);
                  setAppointmentToEdit(null);
                }}
              >
                <FiPlus className="mr-1.5" size={20} />
                <span className="hidden xs:inline">Yeni Randevu</span>
                <span className="inline xs:hidden">Yeni</span>
              </button>
            </div>
          </div>
          
          {/* Filter Controls - moved from top bar */}
          <div className={`mb-4 transition-all duration-200 ease-in-out overflow-hidden ${showFilters ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1 bg-white p-3 rounded-lg shadow-sm">
              <div className="font-medium text-sm text-gray-500">
                Filtreler
              </div>
              
              <button 
                className="text-sm text-gray-500 hover:text-red-600"
                onClick={() => {
                  setShowFilters(false);
                  setSearchQuery('');
                  clearDateFilter();
                }}
              >
                Filtreleri temizle
              </button>
            </div>
          </div>

          {/* Date Filter Indicator */}
          {filterDate && viewMode === 'list' && (
            <div className="mb-4 flex items-center justify-between bg-blue-50 px-4 py-2 rounded-lg shadow-sm">
              <div className="flex items-center text-blue-700">
                <FiCalendar className="mr-2" size={16} />
                <span className="text-sm font-medium">{format(filterDate, 'dd MMMM yyyy')} tarihindeki randevular gösteriliyor</span>
              </div>
              <button
                onClick={clearDateFilter}
                className="text-blue-700 hover:text-blue-800 text-sm font-medium"
              >
                Temizle
              </button>
            </div>
          )}

          {/* Calendar or List View with Enhanced Size */}
          <div className={`bg-white rounded-lg shadow-lg w-full ${viewMode === 'calendar' ? 'h-[75vh]' : ''}`}>
            {viewMode === 'calendar' ? (
              <AppointmentCalendar 
                onDateSelect={handleDateSelect} 
                timeFrame={timeFrame}
                onShowMore={handleShowMore}
              />
            ) : (
              <AppointmentList 
                viewMode={timeFrame}
                selectedDate={filterDate || selectedDate}
                onEditAppointment={handleEditAppointment}
                appointments={filteredAppointments}
                searchQuery={searchQuery}
              />
            )}
          </div>
        </div>
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