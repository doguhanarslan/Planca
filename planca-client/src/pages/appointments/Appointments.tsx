import { useState, useCallback, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { FiCalendar, FiPlus, FiList, FiGrid, FiClock, FiFilter, FiSearch, FiX } from 'react-icons/fi';
import AppointmentCalendar from '@/features/appointments/ui/AppointmentCalendar';
import AppointmentList from '@/features/appointments/AppointmentList';
import AppointmentForm from '@/features/appointments/ui/AppointmentForm';
import { AppointmentDto } from '../../shared/types';

// RTK Query hooks
import { useGetAppointmentsQuery } from '@/features/appointments/api/appointmentsAPI';
import { useDispatch } from 'react-redux';
import { baseApi } from '@/shared/api/base/baseApi';
import { invalidateAppointmentCache } from '@/shared/utils/cacheUtils';

type ViewMode = 'calendar' | 'list';
type TimeFrame = 'day' | 'week' | 'month';

const Appointments = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentDto | null>(null);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
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
    isFetching,
  } = useGetAppointmentsQuery(
    {
      startDate,
      endDate,
      pageSize: 100, // Get more appointments
      sortBy: 'StartTime',
      sortDirection: 'asc',
    },
    {
      // Always refetch when component mounts
      refetchOnMountOrArgChange: true,
      // Refetch on window focus to get latest data
      refetchOnFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't skip the query
      skip: false,
    }
  );
  
  // Process appointments data
  const appointments = useMemo(() => {
    console.log('Processing appointments data:', appointmentsData);
    
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
  const handleAppointmentSuccess = useCallback(async () => {
    console.log('🎉 Appointment operation successful, invalidating cache...');
    
    try {
      // Use enhanced cache invalidation utility
      invalidateAppointmentCache(dispatch);
      
      // Force immediate calendar refresh
      setRefreshTrigger(prev => prev + 1);
      
      // Additional explicit refetch for immediate consistency
      await refetch();
      
      console.log('✅ Cache invalidation and refetch completed');
      
    } catch (error) {
      console.error('❌ Error during cache invalidation:', error);
      // Still try to refresh data even if cache invalidation fails
      try {
        await refetch();
      } catch (refetchError) {
        console.error('❌ Fallback refetch also failed:', refetchError);
      }
    } finally {
      // Close the form
      handleFormClose();
    }
  }, [dispatch, refetch]);
  
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
    <div className="h-full flex flex-col bg-gray-50">
      {/* Modern Page Header */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            {/* Header Content */}
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <FiCalendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Randevular</h1>
                <p className="text-slate-600 text-lg">
                  {appointments.length} randevu {filterDate ? format(filterDate, 'dd MMMM yyyy') : 'bu ay'}
                </p>
              </div>
              {(isLoading || isFetching) && (
                <div className="flex items-center space-x-3 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-full">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Randevular yükleniyor...</span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <FiPlus className="w-5 h-5 mr-2" />
                Yeni Randevu
              </button>
            </div>
          </div>
          
          {/* View Mode and Time Frame Controls */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:justify-between">
            {/* View Mode Controls */}
            <div className="inline-flex bg-white rounded-full shadow-md p-1">
              <button
                onClick={() => handleViewModeChange('calendar')}
                className={`flex items-center px-4 py-2.5 text-sm rounded-full font-medium ${
                  viewMode === 'calendar'
                    ? 'bg-red-100 text-red-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
              >
                <FiGrid className="mr-2" size={16} />
                Takvim
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`flex items-center px-4 py-2.5 text-sm rounded-full font-medium ${
                  viewMode === 'list'
                    ? 'bg-red-100 text-red-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
              >
                <FiList className="mr-2" size={16} />
                Liste
              </button>
            </div>

            {/* Time Frame Controls */}
            <div className="inline-flex bg-white rounded-full shadow-md p-1">
              <button
                onClick={() => handleTimeFrameChange('day')}
                className={`flex items-center px-4 py-2.5 text-sm rounded-full font-medium ${
                  timeFrame === 'day'
                    ? 'bg-red-100 text-red-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
              >
                <FiClock className="mr-2" size={15} />
                Gün
              </button>
              <button
                onClick={() => handleTimeFrameChange('week')}
                className={`flex items-center px-4 py-2.5 text-sm rounded-full font-medium ${
                  timeFrame === 'week'
                    ? 'bg-red-100 text-red-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
              >
                <FiCalendar className="mr-2" size={15} />
                Hafta
              </button>
              <button
                onClick={() => handleTimeFrameChange('month')}
                className={`flex items-center px-4 py-2.5 text-sm rounded-full font-medium ${
                  timeFrame === 'month'
                    ? 'bg-red-100 text-red-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                } transition-colors`}
              >
                <FiCalendar className="mr-2" size={15} />
                Ay
              </button>
            </div>
          </div>

          {/* Filter Badge */}
          {filterDate && (
            <div className="mt-4 flex items-center space-x-3">
              <div className="inline-flex items-center bg-red-100 text-red-700 px-4 py-2 rounded-full">
                <FiFilter className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">
                  Filtrelendi: {format(filterDate, 'dd MMMM yyyy')}
                </span>
                <button
                  onClick={clearDateFilter}
                  className="ml-2 p-1 rounded-full hover:bg-red-200 transition-colors"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2 text-red-700">
                <FiFilter className="w-4 h-4" />
                <span className="text-sm font-medium">Randevular yüklenirken bir hata oluştu. Lütfen tekrar deneyin.</span>
              </div>
            </div>
          )}

          {/* Content based on view mode */}
          {viewMode === 'calendar' ? (
            <AppointmentCalendar
              selectedDate={selectedDate}
              currentCalendarMonth={currentCalendarMonth}
              onMonthChange={handleMonthChange}
              onDateSelect={handleDateSelect}
              timeFrame={timeFrame}
              onShowMore={handleShowMore}
              refreshTrigger={refreshTrigger}
              disabled={isLoading}
            />
          ) : (
            <AppointmentList
              viewMode={timeFrame}
              selectedDate={selectedDate}
              onEditAppointment={handleEditAppointment}
              appointments={filteredAppointments}
              searchQuery={searchQuery}
            />
          )}
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