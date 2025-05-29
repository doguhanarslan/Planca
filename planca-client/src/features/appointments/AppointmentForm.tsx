import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, addMinutes, startOfDay, isBefore,  setHours, setMinutes,  } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CustomerDto, ServiceDto, EmployeeDto, AppointmentDto, WorkingHoursDto } from '../../shared/types';
import { createAppointment, updateAppointment } from './appointmentsSlice';
import { AppDispatch, RootState } from '../../app/store';
import CustomersAPI from '../customers/customersAPI';
import ServicesAPI from '../services/servicesAPI';
import EmployeesAPI from '../employees/employeesAPI';
import AppointmentsAPI from './appointmentsAPI';
import { FiCalendar, FiClock, FiUser, FiTool, FiBriefcase, FiMessageSquare, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface AppointmentFormProps {
  selectedDate: Date;
  onClose: () => void;
  onSuccess?: () => void;
  appointmentToEdit?: AppointmentDto | null;
}


// TODO: Customers, Services, Employees, Appointments gibi verilerin API'den alınmaması gerekiyor. Redux store'da tutulması gerekiyor.
// TODO: Çok fazla Custom State var bunları düzenlemek gerekiyor.

const AppointmentForm = ({ selectedDate, onClose, onSuccess, appointmentToEdit }: AppointmentFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const tenant = useSelector((state: RootState) => state.auth.tenant);
  const isPro = tenant && tenant.subscriptionType === 'Pro';
  const isEditMode = Boolean(appointmentToEdit);
  
  // Form state
  const [customerId, setCustomerId] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<Date>(selectedDate);
  const [appointmentTime, setAppointmentTime] = useState<string>('09:00');
  const [notes, setNotes] = useState<string>('');
  const [customerMessage, setCustomerMessage] = useState<string>('');
  
  // Custom datepicker state
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfDay(selectedDate));
  
  // Data state
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState<number>(30); // Default 30 min
  const [selectedEmployeeWorkingHours, setSelectedEmployeeWorkingHours] = useState<WorkingHoursDto[]>([]);
  
  // Generate all time slots (every 30 minutes from 8:00 to 20:00)
  const allTimeSlots = useMemo(() => {
    const slots = [];
    const startTime = setHours(setMinutes(new Date(), 0), 8);
    const endTime = setHours(setMinutes(new Date(), 0), 20);     // buradan sample veri geliyor bunu düzelt
    let currentSlot = startTime;
    
    while (isBefore(currentSlot, endTime)) {
      slots.push(format(currentSlot, 'HH:mm'));
      currentSlot = addMinutes(currentSlot, 30);
    }
    
    return slots;
  }, []);
  
  // Generate calendar days for the current month view
  // TODO: Bu kısım farklı bir component'e taşınacak.
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Get days from previous month to fill first week
    const daysInWeek = 7;
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const prevMonthDays = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday as first day
    
    const days = [];
    
    // Previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth);
      date.setDate(date.getDate() - (i + 1));
      days.push({ date, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month days to fill last week
    const remainingDays = (Math.ceil(days.length / daysInWeek) * daysInWeek) - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(lastDayOfMonth);
      date.setDate(date.getDate() + i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  }, [currentMonth]);
  
  // Fetch customers, services, and employees on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const customerResponse = await CustomersAPI.getCustomers({
          pageSize: 100,
          sortBy: 'LastName'
        });
        if (customerResponse && customerResponse.items) {
          setCustomers(customerResponse.items);
        }
        
        // Fetch services
        const serviceResponse = await ServicesAPI.getServices({
          isActive: true,
          sortBy: 'Name',
          tenantId: tenant?.id
        });
        if (serviceResponse && serviceResponse.data?.items) {
          setServices(serviceResponse.data.items);
        }
        
        // Fetch all employees initially
        const employeeResponse = await EmployeesAPI.getEmployees({
          tenantId: tenant?.id
        });

        if (employeeResponse && ('items' in employeeResponse)) {
          setEmployees(employeeResponse.items);
          
          // If we're editing and have a serviceId, set available employees right away
          if (isEditMode && appointmentToEdit?.serviceId) {
            const serviceEmployees = employeeResponse.items.filter(
              (employee: EmployeeDto) => employee.serviceIds && employee.serviceIds.includes(appointmentToEdit.serviceId)
            );
            setAvailableEmployees(serviceEmployees);
          } else {
            setAvailableEmployees(employeeResponse.items);
          }
        } else if (employeeResponse && ('data' in employeeResponse) && employeeResponse.data.items) {
          const items = employeeResponse.data.items;
          setEmployees(items);
          
          if (isEditMode && appointmentToEdit?.serviceId) {
            const serviceEmployees = items.filter(
              (employee: EmployeeDto) => employee.serviceIds && employee.serviceIds.includes(appointmentToEdit.serviceId)
            );
            setAvailableEmployees(serviceEmployees);
          } else {
            setAvailableEmployees(items);
          }
        }
      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        setError('Gerekli verileri yüklerken bir hata oluştu');
      }
    };
    
    fetchData();
  }, [isEditMode, appointmentToEdit, tenant?.id]);
  
  // Update available employees when service changes
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!serviceId) {
        // If no service is selected, all employees are available
        setAvailableEmployees(employees);
        return;
      }
      
      try {
        // Filter employees that provide the selected service
        const serviceEmployees = employees.filter(
          (employee) => employee.serviceIds && employee.serviceIds.includes(serviceId)
        );
        
        setAvailableEmployees(serviceEmployees);
      } catch (err) {
        console.error('Personel verileri yüklenirken hata:', err);
      }
    };
    
    fetchEmployees();
  }, [serviceId, employees]);
  
  // Set form values when editing an existing appointment
  useEffect(() => {
    if (appointmentToEdit) {
      // Set customer
      if (appointmentToEdit.customerId) {
        setCustomerId(appointmentToEdit.customerId);
      }
      
      // Set service
      if (appointmentToEdit.serviceId) {
        setServiceId(appointmentToEdit.serviceId);
      }
      
      // Set employee
      if (appointmentToEdit.employeeId) {
        setEmployeeId(appointmentToEdit.employeeId);
      }
      
      // Set date and time
      if (appointmentToEdit.startTime) {
        const appointmentDateTime = new Date(appointmentToEdit.startTime);
        setAppointmentDate(appointmentDateTime);
        setAppointmentTime(format(appointmentDateTime, 'HH:mm'));
        setCurrentMonth(new Date(appointmentDateTime.getFullYear(), appointmentDateTime.getMonth(), 1));
      }
      
      // Set notes
      if (appointmentToEdit.notes) {
        setNotes(appointmentToEdit.notes);
      }
    }
  }, [appointmentToEdit]);
  
  // Update selected service duration when service changes
  useEffect(() => {
    if (serviceId) {
      const selectedService = services.find(service => service.id === serviceId);
      if (selectedService) {
        setSelectedServiceDuration(selectedService.durationMinutes || 30);
      }
    }
  }, [serviceId, services]);
  
  // Fetch employee working hours when employee changes
  useEffect(() => {
    if (!employeeId) {
      setSelectedEmployeeWorkingHours([]);
      return;
    }
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee && employee.workingHours) {
      setSelectedEmployeeWorkingHours(employee.workingHours);
    } else {
      // If for some reason we don't have working hours, try to fetch the employee details
      const fetchEmployeeDetails = async () => {
        try {
          const employeeDetails = await EmployeesAPI.getEmployeeById(employeeId);
          if (employeeDetails && employeeDetails.workingHours) {
            setSelectedEmployeeWorkingHours(employeeDetails.workingHours);
          }
        } catch (error) {
          console.error('Error fetching employee details:', error);
          setSelectedEmployeeWorkingHours([]);
        }
      };
      
      fetchEmployeeDetails();
    }
  }, [employeeId, employees]);

  // Fetch appointments for selected employee and date to determine availability
  useEffect(() => {
    const fetchAppointmentsForDate = async () => {
      if (!employeeId || !appointmentDate) return;
      
      try {
        const fetchedAppointments = await AppointmentsAPI.getAppointmentsForDateAndEmployee(
          employeeId, 
          appointmentDate,
          tenant?.id
        );
        
        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error('Error fetching appointments for availability check:', error);
      }
    };
    
    fetchAppointmentsForDate();
  }, [employeeId, appointmentDate, tenant?.id]);
  
  // Filter available time slots based on employee working hours and existing appointments
  useEffect(() => {
    if (!employeeId || !appointmentDate || !selectedServiceDuration) {
      setAvailableTimeSlots(allTimeSlots);
      return;
    }
    
    // Filter by employee working hours
    const filteredByWorkingHours = filterTimeSlotsByWorkingHours(
      allTimeSlots, 
      selectedEmployeeWorkingHours,
      appointmentDate,
      selectedServiceDuration
    );
    
    // If no working hours available for this day, return empty array
    if (filteredByWorkingHours.length === 0) {
      setAvailableTimeSlots([]);
      return;
    }
    
    // Get already booked time slots
    const bookedSlots = new Set<string>();
    
    // Skip current appointment when editing
    const currentAppointmentId = isEditMode && appointmentToEdit ? appointmentToEdit.id : null;
    
    appointments.forEach(appointment => {
      // Skip the current appointment being edited
      if (isEditMode && currentAppointmentId === appointment.id) {
        return;
      }
      
      if (appointment.startTime) {
        const appointmentStartTime = new Date(appointment.startTime);
        const appointmentEndTime = appointment.endTime 
          ? new Date(appointment.endTime) 
          : addMinutes(appointmentStartTime, getServiceDuration(appointment.serviceId));
        
        // Mark each 15-minute slot within the appointment as booked
        let slotTime = new Date(appointmentStartTime);
        while (isBefore(slotTime, appointmentEndTime)) {
          bookedSlots.add(format(slotTime, 'HH:mm'));
          slotTime = addMinutes(slotTime, 30);
        }
      }
    });
    
    // Helper function to get service duration by serviceId
    function getServiceDuration(serviceId: string): number {
      const service = services.find(s => s.id === serviceId);
      return service ? service.durationMinutes : 30; // Default to 30 minutes if not found
    }
    
    // Filter available slots based on booked appointments
    const availableSlots = filteredByWorkingHours.filter(timeSlot => {
      // Check if this slot is booked
      if (bookedSlots.has(timeSlot)) {
        return false;
      }
      
      // Check if enough consecutive slots are available for the service duration
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const slotStartTime = setHours(setMinutes(new Date(), minutes), hours);
      const slotEndTime = addMinutes(slotStartTime, selectedServiceDuration);
      
      // Check each 15-min slot within the service duration
      let currentCheckTime = slotStartTime;
      while (isBefore(currentCheckTime, slotEndTime)) {
        const timeKey = format(currentCheckTime, 'HH:mm');
        if (bookedSlots.has(timeKey)) {
          return false;
        }
        currentCheckTime = addMinutes(currentCheckTime, 30);
      }
      
      return true;
    });
    
    setAvailableTimeSlots(availableSlots);
    
    // If current time is not available, reset it to first available
    if (availableSlots.length > 0 && !availableSlots.includes(appointmentTime)) {
      setAppointmentTime(availableSlots[0]);
    }
  }, [allTimeSlots, appointments, appointmentDate, employeeId, selectedServiceDuration, isEditMode, appointmentToEdit, appointmentTime, services, selectedEmployeeWorkingHours]);
  
  // Filter time slots by employee working hours
  const filterTimeSlotsByWorkingHours = (
    timeSlots: string[],
    workingHours: WorkingHoursDto[],
    date: Date,
    serviceDuration: number
  ): string[] => {
    if (!workingHours || workingHours.length === 0) {
      return timeSlots; // If no working hours defined, return all slots
    }
    
    // Get day of week (0-6, where 0 is Sunday)
    const dayOfWeek = date.getDay();
    
    // Convert to 1-7 where 1 is Monday, 7 is Sunday
    const dayIndex = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    // Find working hours for this day
    const dayWorkingHours = workingHours.find(wh => wh.dayOfWeek === dayIndex);
    
    // If not a working day or no hours defined, return empty array
    if (!dayWorkingHours || !dayWorkingHours.isWorkingDay) {
      console.log('Not a working day for employee:', dayIndex);
      return [];
    }
    
    // Parse start and end times
    let startTimeString = dayWorkingHours.startTime;
    let endTimeString = dayWorkingHours.endTime;
    
    // Handle different time formats
    if (!startTimeString.includes(':')) {
      startTimeString = `${startTimeString}:00`;
    }
    
    if (!endTimeString.includes(':')) {
      endTimeString = `${endTimeString}:00`;
    }
    
    // Create date objects for start and end times
    const [startHours, startMinutes] = startTimeString.split(':').map(Number);
    const [endHours, endMinutes] = endTimeString.split(':').map(Number);
    
    // Return only slots that fall within working hours and allow enough time for the service
    return timeSlots.filter(slot => {
      const [slotHours, slotMinutes] = slot.split(':').map(Number);
      
      // Check if slot starts during working hours
      const isAfterStart = (
        slotHours > startHours || 
        (slotHours === startHours && slotMinutes >= startMinutes)
      );
      
      // Calculate service end time
      const serviceEndHours = Math.floor(slotHours + (slotMinutes + serviceDuration) / 60);
      const serviceEndMinutes = (slotMinutes + serviceDuration) % 60;
      
      // Check if service will finish before end of working hours
      const isBeforeEnd = (
        serviceEndHours < endHours || 
        (serviceEndHours === endHours && serviceEndMinutes <= endMinutes)
      );
      
      return isAfterStart && isBeforeEnd;
    });
  };
  
  // Handle month navigation
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setAppointmentDate(date);
    setCalendarOpen(false);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || !serviceId || !employeeId || !appointmentDate || !appointmentTime) {
      setError('Lütfen tüm gerekli alanları doldurun');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Combine date and time to create startTime
      const [hours, minutes] = appointmentTime.split(':').map(Number);
      const startTime = new Date(appointmentDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      const appointmentData = {
        customerId,
        serviceId,
        employeeId,
        startTime: startTime.toISOString(),
        notes
      };
      
      if (isEditMode && appointmentToEdit) {
        // Update existing appointment
        await dispatch(updateAppointment({
          id: appointmentToEdit.id,
          ...appointmentData
        })).unwrap();
      } else {
        // Create new appointment
        await dispatch(createAppointment(appointmentData)).unwrap();
      }
      
      // Show success message or redirect
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error(`Randevu ${isEditMode ? 'güncellenirken' : 'oluşturulurken'} hata:`, error);
      setError(`Randevu ${isEditMode ? 'güncellenemedi' : 'oluşturulamadı'}`);
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {isEditMode ? 'Randevu Düzenle' : 'Yeni Randevu Oluştur'}
        </h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
          aria-label="Kapat"
        >
          <FiX size={24} className="text-gray-500" />
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Selection */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiUser className="mr-2 text-red-500" />
                Müşteri
              </div>
            </label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">Müşteri seçin</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.fullName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Service Selection */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiTool className="mr-2 text-red-500" />
                Hizmet
              </div>
            </label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  setEmployeeId(''); // Reset employee when service changes
                }}
                required
              >
                <option value="">Hizmet seçin</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} (${service.price})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Employee Selection */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiBriefcase className="mr-2 text-red-500" />
                Personel
              </div>
            </label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                disabled={!serviceId || availableEmployees.length === 0}
              >
                <option value="">Personel seçin</option>
                {availableEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {serviceId && availableEmployees.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                Bu hizmet için uygun personel bulunmuyor
              </p>
            )}
          </div>
          
          {/* Appointment Date - Custom Calendar */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiCalendar className="mr-2 text-red-500" />
                Tarih
              </div>
            </label>
            <div className="relative">
              <button
                type="button"
                className="w-full flex items-center justify-between border border-gray-300 rounded-md py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                onClick={() => setCalendarOpen(!calendarOpen)}
              >
                <span>{format(appointmentDate, 'd MMMM yyyy', { locale: tr })}</span>
                <FiCalendar className="text-gray-500" />
              </button>
              
              {/* Custom Calendar Dropdown */}
              {calendarOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg">
                  <div className="p-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={previousMonth}
                      >
                        <FiChevronLeft className="text-gray-600" />
                      </button>
                      <div className="font-medium">
                        {format(currentMonth, 'MMMM yyyy', { locale: tr })}
                      </div>
                      <button
                        type="button"
                        className="p-1 rounded-full hover:bg-gray-100"
                        onClick={nextMonth}
                      >
                        <FiChevronRight className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 text-center text-xs leading-6 text-gray-500 border-b border-gray-200 pb-1 mb-1">
                      <div>Pt</div>
                      <div>Sa</div>
                      <div>Ça</div>
                      <div>Pe</div>
                      <div>Cu</div>
                      <div>Ct</div>
                      <div>Pz</div>
                    </div>
                    
                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, index) => {
                        const isSelected = day.date.getDate() === appointmentDate.getDate() &&
                                         day.date.getMonth() === appointmentDate.getMonth() &&
                                         day.date.getFullYear() === appointmentDate.getFullYear();
                        const isToday = day.date.getDate() === new Date().getDate() &&
                                     day.date.getMonth() === new Date().getMonth() &&
                                     day.date.getFullYear() === new Date().getFullYear();
                        
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleDateSelect(day.date)}
                            className={`
                              h-9 text-sm rounded-md flex items-center justify-center
                              ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                              ${isSelected ? 'bg-red-500 text-white font-semibold' : ''}
                              ${isToday && !isSelected ? 'bg-red-100 font-semibold' : ''}
                              ${day.isCurrentMonth && !isSelected && !isToday ? 'hover:bg-gray-100' : ''}
                            `}
                          >
                            {day.date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Appointment Time - Dropdown */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiClock className="mr-2 text-red-500" />
                Saat
              </div>
            </label>
            <div className="relative">
              <select
                className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
                disabled={availableTimeSlots.length === 0}
              >
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))
                ) : (
                  <option value="">Uygun zaman aralığı bulunamadı</option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {availableTimeSlots.length === 0 && employeeId && (
              <p className="text-sm text-red-500 mt-1">
                Bu tarihte personel müsait değil
              </p>
            )}
          </div>
          
          {/* Notes */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiMessageSquare className="mr-2 text-red-500" />
                Notlar
              </div>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bu randevu hakkında notlar ekleyin"
            />
          </div>
          
          {/* Customer Message (Pro feature) */}
          {isPro && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FiMessageSquare className="mr-2 text-red-500" />
                  Müşteri Mesajı
                </div>
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="Müşteriye gönderilecek mesaj"
              />
              <p className="text-xs text-gray-500 mt-1">
                Bu mesaj müşteriye gönderilecektir (Pro özelliği)
              </p>
            </div>
          )}
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 shadow-sm rounded-md text-gray-700 hover:bg-gray-100 border border-gray-300 focus:outline-none hover:cursor-pointer duration-300"
            onClick={onClose}
            disabled={loading}
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 shadow-sm rounded-md text-white hover:bg-red-700 focus:outline-none bg-red-600 hover:cursor-pointer duration-300"
            disabled={loading || availableTimeSlots.length === 0}
          >
            {loading ? 'İşleniyor...' : isEditMode ? 'Randevuyu Güncelle' : 'Randevu Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm; 