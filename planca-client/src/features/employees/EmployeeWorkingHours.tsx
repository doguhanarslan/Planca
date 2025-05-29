import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { updateEmployee } from './employeesSlice';
import { EmployeeDto, WorkingHoursDto } from '@/shared/types';
import Alert from '@/shared/ui/components/Alert';

interface EmployeeWorkingHoursProps {
  employee: EmployeeDto;
}

const EmployeeWorkingHours: React.FC<EmployeeWorkingHoursProps> = ({ employee }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const { loading, error } = useAppSelector(state => state.employees);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Create a working hours map for easier management by creating a deep copy
  const [workingHours, setWorkingHours] = useState<WorkingHoursDto[]>(() => {
    if (employee.workingHours && employee.workingHours.length > 0) {
      return employee.workingHours.map(wh => ({
        dayOfWeek: wh.dayOfWeek,
        startTime: wh.startTime,
        endTime: wh.endTime,
        isWorkingDay: wh.isWorkingDay
      }));
    }
    return getDefaultWorkingHours();
  });
  
  // Ensure working hours are updated when employee changes
  useEffect(() => {
    if (employee.workingHours && employee.workingHours.length > 0) {
      setWorkingHours(employee.workingHours.map(wh => ({
        dayOfWeek: wh.dayOfWeek,
        startTime: wh.startTime,
        endTime: wh.endTime,
        isWorkingDay: wh.isWorkingDay
      })));
    }
  }, [employee.id]);
  
  // Get default working hours for all days of the week
  function getDefaultWorkingHours(): WorkingHoursDto[] {
    const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    return days.map(day => ({
      dayOfWeek: day,
      startTime: '09:00:00',
      endTime: '17:00:00',
      isWorkingDay: day !== 0 && day !== 6 // Mon-Fri as working days by default
    }));
  }
  
  // Get day name from day number
  const getDayName = (dayNumber: number): string => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[dayNumber];
  };
  
  // Format time for display
  const formatTime = (time: string): string => {
    if (!time) return '';
    // If time is in format HH:MM:SS, convert to HH:MM
    if (time.includes(':')) {
      const parts = time.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };
  
  // Handle working day toggle
  const handleWorkingDayChange = (dayOfWeek: number) => {
    setWorkingHours(prevHours => 
      prevHours.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { ...day, isWorkingDay: !day.isWorkingDay } 
          : day
      )
    );
  };
  
  // Handle time change
  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setWorkingHours(prevHours => 
      prevHours.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { ...day, [field]: value + ':00' } // Add seconds for backend format
          : day
      )
    );
  };
  
  // Save changes
  const handleSave = async () => {
    try {
      await dispatch(updateEmployee({
        id: employee.id,
        employeeData: {
          ...employee,
          workingHours: workingHours.map(wh => ({
            dayOfWeek: wh.dayOfWeek,
            startTime: wh.startTime,
            endTime: wh.endTime,
            isWorkingDay: wh.isWorkingDay
          }))
        }
      }));
      
      setSuccessMessage('Çalışma saatleri başarıyla güncellendi.');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating working hours:', err);
    }
  };
  
  return (
    <div>
      {/* Success message */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
        />
      )}
      
      {/* Error message */}
      {error && (
        <Alert
          type="error"
          message={error}
        />
      )}
      
      <div className="mb-4 flex justify-end">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Düzenle
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                // Reset to original working hours with proper deep copy
                if (employee.workingHours && employee.workingHours.length > 0) {
                  setWorkingHours(employee.workingHours.map(wh => ({
                    dayOfWeek: wh.dayOfWeek,
                    startTime: wh.startTime,
                    endTime: wh.endTime,
                    isWorkingDay: wh.isWorkingDay
                  })));
                } else {
                  setWorkingHours(getDefaultWorkingHours());
                }
                setIsEditing(false);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        )}
      </div>
      
      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {workingHours
            .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
            .map((day) => (
              <li key={day.dayOfWeek}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {isEditing ? (
                        <input
                          type="checkbox"
                          id={`working-day-${day.dayOfWeek}`}
                          checked={day.isWorkingDay}
                          onChange={() => handleWorkingDayChange(day.dayOfWeek)}
                          className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          disabled={loading}
                        />
                      ) : (
                        <span className={`flex-shrink-0 rounded-full h-3 w-3 ${day.isWorkingDay ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      )}
                      <label
                        htmlFor={`working-day-${day.dayOfWeek}`}
                        className={`ml-3 text-sm font-medium ${day.isWorkingDay ? 'text-gray-900' : 'text-gray-500'}`}
                      >
                        {getDayName(day.dayOfWeek)}
                      </label>
                    </div>
                    
                    {isEditing ? (
                      <div className="flex items-center space-x-3">
                        <div>
                          <label htmlFor={`start-time-${day.dayOfWeek}`} className="sr-only">
                            Başlangıç Saati
                          </label>
                          <input
                            type="time"
                            id={`start-time-${day.dayOfWeek}`}
                            value={formatTime(day.startTime)}
                            onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                            className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            disabled={!day.isWorkingDay || loading}
                          />
                        </div>
                        <span className="text-gray-500">-</span>
                        <div>
                          <label htmlFor={`end-time-${day.dayOfWeek}`} className="sr-only">
                            Bitiş Saati
                          </label>
                          <input
                            type="time"
                            id={`end-time-${day.dayOfWeek}`}
                            value={formatTime(day.endTime)}
                            onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                            className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            disabled={!day.isWorkingDay || loading}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        {day.isWorkingDay ? (
                          <span>{formatTime(day.startTime)} - {formatTime(day.endTime)}</span>
                        ) : (
                          <span>Çalışma yok</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Çalışma saatleri, personelin randevu alabileceği zaman aralıklarını belirler.</p>
      </div>
    </div>
  );
};

export default EmployeeWorkingHours; 