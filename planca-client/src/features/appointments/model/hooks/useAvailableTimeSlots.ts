import { useState, useEffect, useMemo } from 'react';
import { format, addMinutes, isBefore, setHours, setMinutes } from 'date-fns';
import { AppointmentDto, EmployeeDto, ServiceDto, WorkingHoursDto } from '../../../../shared/types';
import AppointmentsAPI from '../../api/appointmentsAPI'; 
import { generateAllTimeSlots, filterTimeSlotsByWorkingHours } from '../../lib/timeSlotUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../app/store';

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
  const tenant = useSelector((state: RootState) => state.auth.tenant);
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const allTimeSlots = useMemo(() => generateAllTimeSlots(), []);

  useEffect(() => {
    const fetchAppointmentsForDate = async () => {
      if (!employeeId || !appointmentDate || !tenant?.id) {
        setAppointments([]);
        return;
      }
      setIsLoading(true);
      try {
        const fetchedAppointments = await AppointmentsAPI.getAppointmentsForDateAndEmployee(
          employeeId,
          appointmentDate,
          tenant.id
        );
        setAppointments(fetchedAppointments || []);
      } catch (error) {
        console.error('Error fetching appointments for availability check:', error);
        setAppointments([]);
      }
      setIsLoading(false);
    };

    fetchAppointmentsForDate();
  }, [employeeId, appointmentDate, tenant?.id]);

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

    const bookedSlots = new Set<string>();
    appointments.forEach(appointment => {
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
  ]);

  return { availableTimeSlots, isLoadingAppointments: isLoading };
};

function getServiceDuration(serviceId: string, services: ServiceDto[]): number {
  const service = services.find(s => s.id === serviceId);
  return service ? service.durationMinutes : 30;
}

// The API file `planca-client/src/features/appointments/api/appointmentsAPI.ts` needs to be created.
// It should export `getAppointmentsForDateAndEmployee` function similar to the one used in the original `AppointmentForm.tsx`.
// Example:
// import { AppointmentDto } from '../../../shared/types';
// const getAppointmentsForDateAndEmployee = async (employeeId: string, date: Date, tenantId: string | undefined): Promise<AppointmentDto[]> => { ... };
// export default { getAppointmentsForDateAndEmployee }; 