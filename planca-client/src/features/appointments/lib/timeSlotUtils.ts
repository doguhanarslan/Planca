import { format, addMinutes, setHours, setMinutes, isBefore } from 'date-fns';
import { WorkingHoursDto } from '../../../shared/types';

export const generateAllTimeSlots = (startTimeHour: number = 8, endTimeHour: number = 20, intervalMinutes: number = 30): string[] => {
  const slots = [];
  const startTime = setHours(setMinutes(new Date(), 0), startTimeHour);
  const endTime = setHours(setMinutes(new Date(), 0), endTimeHour);
  let currentSlot = startTime;

  while (isBefore(currentSlot, endTime)) {
    slots.push(format(currentSlot, 'HH:mm'));
    currentSlot = addMinutes(currentSlot, intervalMinutes);
  }
  return slots;
};

export const filterTimeSlotsByWorkingHours = (
  timeSlots: string[],
  workingHours: WorkingHoursDto[],
  date: Date,
  serviceDuration: number
): string[] => {
  if (!workingHours || workingHours.length === 0) {
    return timeSlots;
  }

  const dayOfWeek = date.getDay();
  const dayIndex = dayOfWeek === 0 ? 7 : dayOfWeek; // Sunday is 0, Monday is 1. Convert to 1 (Mon) - 7 (Sun)
  const dayWorkingHours = workingHours.find(wh => wh.dayOfWeek === dayIndex);

  if (!dayWorkingHours || !dayWorkingHours.isWorkingDay) {
    return [];
  }

  let startTimeString = dayWorkingHours.startTime;
  let endTimeString = dayWorkingHours.endTime;

  if (!startTimeString.includes(':')) startTimeString = `${startTimeString}:00`;
  if (!endTimeString.includes(':')) endTimeString = `${endTimeString}:00`;

  const [startHours, startMinutes] = startTimeString.split(':').map(Number);
  const [endHours, endMinutes] = endTimeString.split(':').map(Number);

  return timeSlots.filter(slot => {
    const [slotHours, slotMinutes] = slot.split(':').map(Number);

    const isAfterStart = slotHours > startHours || (slotHours === startHours && slotMinutes >= startMinutes);

    const serviceEndTime = addMinutes(setHours(setMinutes(new Date(date), slotMinutes), slotHours), serviceDuration);
    
    const serviceEndH = serviceEndTime.getHours();
    const serviceEndM = serviceEndTime.getMinutes();

    const isBeforeEnd = serviceEndH < endHours || (serviceEndH === endHours && serviceEndM <= endMinutes);
    
    return isAfterStart && isBeforeEnd;
  });
}; 