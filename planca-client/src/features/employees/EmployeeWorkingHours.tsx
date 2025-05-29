import React, { useState } from 'react';
import { EmployeeDto, WorkingHoursDto } from '@/shared/types';
import { useUpdateEmployeeWorkingHoursMutation } from './api/employeesAPI';

interface EmployeeWorkingHoursProps {
  employee: EmployeeDto;
}

const daysOfWeek = [
  { value: 1, label: 'Pazartesi', shortLabel: 'Pzt' },
  { value: 2, label: 'Salı', shortLabel: 'Sal' },
  { value: 3, label: 'Çarşamba', shortLabel: 'Çar' },
  { value: 4, label: 'Perşembe', shortLabel: 'Per' },
  { value: 5, label: 'Cuma', shortLabel: 'Cum' },
  { value: 6, label: 'Cumartesi', shortLabel: 'Cmt' },
  { value: 7, label: 'Pazar', shortLabel: 'Paz' },
];

const EmployeeWorkingHours: React.FC<EmployeeWorkingHoursProps> = ({ employee }) => {
  const [editMode, setEditMode] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHoursDto[]>(
    employee.workingHours || daysOfWeek.map(day => ({
      dayOfWeek: day.value,
      startTime: '09:00',
      endTime: '17:00',
      isWorkingDay: day.value >= 1 && day.value <= 5, // Monday to Friday default
    }))
  );

  // RTK Query hook
  const [updateWorkingHours, { isLoading: isUpdating, error: updateError }] = useUpdateEmployeeWorkingHoursMutation();

  const handleWorkingDayChange = (dayOfWeek: number, isWorkingDay: boolean) => {
    setWorkingHours(prev => 
      prev.map(wh => 
        wh.dayOfWeek === dayOfWeek 
          ? { ...wh, isWorkingDay }
          : wh
      )
    );
  };

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setWorkingHours(prev => 
      prev.map(wh => 
        wh.dayOfWeek === dayOfWeek 
          ? { ...wh, [field]: value }
          : wh
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateWorkingHours({
        id: employee.id,
        workingHours: workingHours,
      }).unwrap();
      
      setEditMode(false);
    } catch (error) {
      console.error('Working hours update failed:', error);
    }
  };

  const handleCancel = () => {
    setWorkingHours(
      employee.workingHours || daysOfWeek.map(day => ({
        dayOfWeek: day.value,
        startTime: '09:00',
        endTime: '17:00',
        isWorkingDay: day.value >= 1 && day.value <= 5,
      }))
    );
    setEditMode(false);
  };

  const copyToAllDays = (sourceDay: WorkingHoursDto) => {
    if (window.confirm('Bu çalışma saatlerini tüm günlere kopyalamak istediğinizden emin misiniz?')) {
      setWorkingHours(prev =>
        prev.map(wh => ({
          ...wh,
          startTime: sourceDay.startTime,
          endTime: sourceDay.endTime,
          isWorkingDay: sourceDay.isWorkingDay,
        }))
      );
    }
  };

  const setWorkingDaysOnly = () => {
    setWorkingHours(prev =>
      prev.map(wh => ({
        ...wh,
        isWorkingDay: wh.dayOfWeek >= 1 && wh.dayOfWeek <= 5, // Monday to Friday
      }))
    );
  };

  if (editMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Çalışma Saatlerini Düzenle</h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={setWorkingDaysOnly}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              Sadece Hafta İçi
            </button>
          </div>
        </div>

        {updateError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Çalışma saatleri güncellenirken bir hata oluştu.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Çalışıyor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Başlangıç
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bitiş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {daysOfWeek.map((day) => {
                  const dayWorkingHours = workingHours.find(wh => wh.dayOfWeek === day.value) || {
                    dayOfWeek: day.value,
                    startTime: '09:00',
                    endTime: '17:00',
                    isWorkingDay: false,
                  };

                  return (
                    <tr key={day.value} className={!dayWorkingHours.isWorkingDay ? 'bg-gray-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {day.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={dayWorkingHours.isWorkingDay}
                          onChange={(e) => handleWorkingDayChange(day.value, e.target.checked)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          value={dayWorkingHours.startTime}
                          onChange={(e) => handleTimeChange(day.value, 'startTime', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-gray-100"
                          disabled={!dayWorkingHours.isWorkingDay || isUpdating}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          value={dayWorkingHours.endTime}
                          onChange={(e) => handleTimeChange(day.value, 'endTime', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-gray-100"
                          disabled={!dayWorkingHours.isWorkingDay || isUpdating}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dayWorkingHours.isWorkingDay && (
                          <button
                            type="button"
                            onClick={() => copyToAllDays(dayWorkingHours)}
                            className="text-red-600 hover:text-red-900 text-xs"
                            disabled={isUpdating}
                          >
                            Tümüne Kopyala
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={isUpdating}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              disabled={isUpdating}
            >
              {isUpdating ? 'Güncelleniyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Çalışma Saatleri</h3>
        <button
          onClick={() => setEditMode(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Düzenle
        </button>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gün
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Çalışma Saatleri
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {daysOfWeek.map((day) => {
              const dayWorkingHours = workingHours.find(wh => wh.dayOfWeek === day.value);
              const isWorkingDay = dayWorkingHours?.isWorkingDay || false;

              return (
                <tr key={day.value} className={!isWorkingDay ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {day.label}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isWorkingDay 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isWorkingDay ? 'Çalışıyor' : 'Tatil'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {isWorkingDay && dayWorkingHours ? 
                      `${dayWorkingHours.startTime} - ${dayWorkingHours.endTime}` : 
                      '-'
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(!employee.workingHours || employee.workingHours.length === 0) && (
        <div className="text-center py-6">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Çalışma saatleri belirlenmemiş</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bu personel için çalışma saatleri henüz ayarlanmamış.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Çalışma Saatleri Belirle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeWorkingHours;