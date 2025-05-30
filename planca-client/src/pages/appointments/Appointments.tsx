import { useState, useCallback, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { FiCalendar, FiPlus, FiList, FiGrid, FiClock, FiFilter, FiSearch } from 'react-icons/fi';
import AppointmentCalendar from '@/features/appointments/ui/AppointmentCalendar';
import AppointmentList from '@/features/appointments/AppointmentList';
import AppointmentForm from '@/features/appointments/ui/AppointmentForm';
import { AppointmentDto } from '../../shared/types';

// RTK Query hooks
import { useGetAppointmentsQuery } from '@/features/appointments/api/appointmentsAPI';

type ViewMode = 'calendar' | 'list';
type TimeFrame = 'day' | 'week' | 'month';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentDto | null>(null);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Calculate date range for appointments query
  const { startDate, endDate } = useMemo(() => {
    const today = selectedDate;
    
    // Always fetch a month's worth of data for better caching
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    
    return {
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
    };
  }, [selectedDate]);
  
  // RTK Query for appointments
  const {
    data: appointmentsData,
    isLoading,
    error,
    refetch,
  } = useGetAppointmentsQuery(
    {
      startDate,
      endDate,
      pageSize: 99, // Get more appointments
      sortBy: 'StartTime',
      sortDirection: 'asc',
    },
    {
      // Refetch on mount if data is older than 2 minutes
      refetchOnMountOrArgChange: 120,
      // Refetch on window focus
      refetchOnFocus: true,
    }
  );
  
  // Process appointments data
  const appointments = useMemo(() => {
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
    // Refetch appointments to get the latest data
    refetch();
    
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
  
  // Handler for month change in the calendar
  const handleMonthChange = (newMonth: Date) => {
    setCurrentCalendarMonth(newMonth);
    setSelectedDate(newMonth); // This will trigger refetch with new date range
  };
  
  // Clear date filter
  const clearDateFilter = () => {
    setFilterDate(null);
  };
  
  // Filter appointments if filterDate is set
  const filteredAppointments = useMemo(() => {
    if (!filterDate) return appointments;
    
    return appointments?.filter((appointment: AppointmentDto) => 
      appointment.startTime && 
      isSameDay(new Date(appointment.startTime), filterDate)
    );
  }, [appointments, filterDate]);

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
              
              {/* Action Buttons */}
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
            
            {/* Filter Controls */}
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
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="mb-4 flex items-center justify-center bg-blue-50 px-4 py-2 rounded-lg shadow-sm">
                <div className="flex items-center text-blue-700">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-sm font-medium">Randevular yükleniyor...</span>
                </div>
              </div>
            )}
            
            {/* Error indicator */}
            {error && !isLoading && (
              <div className="mb-4 flex items-center justify-between bg-red-50 px-4 py-2 rounded-lg shadow-sm">
                <div className="flex items-center text-red-700">
                  <span className="text-sm font-medium">Randevuları yüklerken bir hata oluştu</span>
                </div>
                <button
                  onClick={() => refetch()}
                  className="text-red-700 hover:text-red-800 text-sm font-medium"
                >
                  Tekrar Dene
                </button>
              </div>
            )}

            {/* Calendar or List View with Enhanced Size */}
            <div className={`bg-white rounded-lg shadow-lg w-full ${viewMode === 'calendar' ? 'h-[75vh]' : ''}`}>
              {viewMode === 'calendar' ? (
                <AppointmentCalendar
                  selectedDate={selectedDate}
                  currentCalendarMonth={currentCalendarMonth}
                  onMonthChange={handleMonthChange}
                  disabled={isLoading}
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