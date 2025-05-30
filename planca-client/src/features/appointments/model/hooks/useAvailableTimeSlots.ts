import { useState, useEffect, useMemo } from 'react';
import { format, addMinutes, isBefore, setHours, setMinutes } from 'date-fns';
import { ServiceDto, WorkingHoursDto } from '../../../../shared/types';
import { generateAllTimeSlots, filterTimeSlotsByWorkingHours } from '../../lib/timeSlotUtils';

// RTK Query hook
import { useGetAppointmentsForDateAndEmployeeQuery } from '../../api/appointmentsAPI';

interface UseAvailableTimeSlotsProps {
  employeeId: string | null;
  appointmentDate: Date | null;
  selectedServiceDuration: number;
  services: ServiceDto[];
  selectedEmployeeWorkingHours: WorkingHoursDto[];
  isEditMode: boolean;
  appointmentToEditId: string | null;
}

export const useAvailableTimeSlots = ({
  employeeId,
  appointmentDate,
  selectedServiceDuration,
  services,
  selectedEmployeeWorkingHours,
  isEditMode,
  appointmentToEditId,
}: UseAvailableTimeSlotsProps) => {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  const allTimeSlots = useMemo(() => generateAllTimeSlots(), []);

  // RTK Query for getting appointments for the specific date and employee
  const {
    data: appointments = [],
    isLoading: isLoadingAppointments,
    error: appointmentsError,
  } = useGetAppointmentsForDateAndEmployeeQuery(
    {
      employeeId: employeeId || '',
      date: appointmentDate?.toISOString() || '',
    },
    {
      // Only fetch if we have both employeeId and appointmentDate
      skip: !employeeId || !appointmentDate,
      // Refetch on mount if data is older than 2 minutes
      refetchOnMountOrArgChange: 120,
      // Refetch on focus to ensure fresh data
      refetchOnFocus: true,
    }
  );

  useEffect(() => {
    if (!employeeId || !appointmentDate || !selectedServiceDuration) {
      setAvailableTimeSlots(allTimeSlots);
      return;
    }

    const filteredByWorkingHours = filterTimeSlotsByWorkingHours(
      allTimeSlots,
      selectedEmployeeWorkingHours,
      appointmentDate,
      selectedServiceDuration
    );

    if (filteredByWorkingHours.length === 0) {
      setAvailableTimeSlots([]);
      return;
    }

    // Don't process if we're still loading appointments
    if (isLoadingAppointments) {
      return;
    }

    const bookedSlots = new Set<string>();
    appointments.forEach(appointment => {
      // Skip the appointment we're editing
      if (isEditMode && appointmentToEditId === appointment.id) {
        return;
      }
      
      if (appointment.startTime) {
        const appointmentStartTime = new Date(appointment.startTime);
        const appointmentEndTime = appointment.endTime
          ? new Date(appointment.endTime)
          : addMinutes(appointmentStartTime, getServiceDuration(appointment.serviceId, services));

        let slotTime = new Date(appointmentStartTime);
        while (isBefore(slotTime, appointmentEndTime)) {
          bookedSlots.add(format(slotTime, 'HH:mm'));
          slotTime = addMinutes(slotTime, 30); // Assuming 30 min intervals for booked slots as well
        }
      }
    });

    const finalAvailableSlots = filteredByWorkingHours.filter(timeSlot => {
      if (bookedSlots.has(timeSlot)) {
        return false;
      }
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const slotStartTime = setHours(setMinutes(new Date(), minutes), hours);
      const slotEndTime = addMinutes(slotStartTime, selectedServiceDuration);

      let currentCheckTime = slotStartTime;
      while (isBefore(currentCheckTime, slotEndTime)) {
        const timeKey = format(currentCheckTime, 'HH:mm');
        if (bookedSlots.has(timeKey)) {
          return false;
        }
        currentCheckTime = addMinutes(currentCheckTime, 30); // Check in 30 min intervals
      }
      return true;
    });

    setAvailableTimeSlots(finalAvailableSlots);

  }, [
    allTimeSlots,
    appointments,
    appointmentDate,
    employeeId,
    selectedServiceDuration,
    selectedEmployeeWorkingHours,
    services,
    isEditMode,
    appointmentToEditId,
    isLoadingAppointments,
  ]);

  return { 
    availableTimeSlots, 
    isLoadingAppointments,
    appointmentsError,
  };
};

function getServiceDuration(serviceId: string, services: ServiceDto[]): number {
  const service = services.find(s => s.id === serviceId);
  return service ? service.durationMinutes : 30;
}