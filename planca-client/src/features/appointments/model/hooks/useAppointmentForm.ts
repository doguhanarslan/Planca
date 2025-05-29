import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, startOfDay } from 'date-fns';
import { CustomerDto, ServiceDto, EmployeeDto, AppointmentDto, WorkingHoursDto } from '../../../../shared/types';
import { createAppointment, updateAppointment } from '../../appointmentsSlice';
import { AppDispatch, RootState } from '../../../../app/store';
import CustomersAPI from '../../../customers/customersAPI';
import EmployeesAPI from '../../../employees/employeesAPI';

interface UseAppointmentFormProps {
  selectedDate: Date;
  appointmentToEdit?: AppointmentDto | null;
  onClose: () => void;
  onSuccess?: () => void;
  externalServices?: ServiceDto[];
}

export const useAppointmentForm = ({
  selectedDate,
  appointmentToEdit,
  onClose,
  onSuccess,
  externalServices,
}: UseAppointmentFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const tenant = useSelector((state: RootState) => state.auth.tenant);
  const isPro = tenant && tenant.subscriptionType === 'Pro';
  const isEditMode = Boolean(appointmentToEdit);

  const [customerId, setCustomerId] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<Date>(selectedDate);
  const [appointmentTime, setAppointmentTime] = useState<string>('09:00');
  const [notes, setNotes] = useState<string>('');
  const [customerMessage, setCustomerMessage] = useState<string>('');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(startOfDay(selectedDate));

  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [services, setServices] = useState<ServiceDto[]>(externalServices || []);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeDto[]>([]);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState<number>(30);
  const [selectedEmployeeWorkingHours, setSelectedEmployeeWorkingHours] = useState<WorkingHoursDto[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (externalServices) {
      setServices(externalServices);
    }
  }, [externalServices]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [customerResponse, employeeResponse] = await Promise.all([
          CustomersAPI.getCustomers({ pageSize: 100, sortBy: 'LastName' }),
          EmployeesAPI.getEmployees({ tenantId: tenant?.id })
        ]);

        if (customerResponse && customerResponse.items) {
          setCustomers(customerResponse.items);
        }
        if (employeeResponse && ('items' in employeeResponse)) {
          setEmployees(employeeResponse.items);
          setAvailableEmployees(employeeResponse.items);
        } else if (employeeResponse && ('data' in employeeResponse) && employeeResponse.data.items) {
          setEmployees(employeeResponse.data.items);
          setAvailableEmployees(employeeResponse.data.items);
        }
      } catch (err) {
        console.error('Form data loading error (customers/employees):', err);
        setError('Müşteri veya personel verileri yüklenemedi.');
      }
      setLoading(false);
    };
    if (tenant?.id) {
      fetchData();
    }
  }, [tenant?.id]);

  useEffect(() => {
    if (appointmentToEdit) {
      setCustomerId(appointmentToEdit.customerId || '');
      setServiceId(appointmentToEdit.serviceId || '');
      setEmployeeId(appointmentToEdit.employeeId || '');
      if (appointmentToEdit.startTime) {
        const appDate = new Date(appointmentToEdit.startTime);
        setAppointmentDate(appDate);
        setAppointmentTime(format(appDate, 'HH:mm'));
        setCurrentCalendarMonth(startOfDay(appDate));
      }
      setNotes(appointmentToEdit.notes || '');
    }
  }, [appointmentToEdit]);

  useEffect(() => {
    if (!serviceId) {
      setAvailableEmployees(employees);
      setEmployeeId('');
      return;
    }
    const filtered = employees.filter(
      (emp) => emp.serviceIds && emp.serviceIds.includes(serviceId)
    );
    setAvailableEmployees(filtered);
    if (employeeId && !filtered.find(emp => emp.id === employeeId)) {
        setEmployeeId('');
    }
  }, [serviceId, employees, employeeId]);

  useEffect(() => {
    if (serviceId && services.length > 0) {
      const service = services.find(s => s.id === serviceId);
      setSelectedServiceDuration(service?.durationMinutes || 30);
    } else {
      setSelectedServiceDuration(30);
    }
  }, [serviceId, services]);

  useEffect(() => {
    if (!employeeId) {
      setSelectedEmployeeWorkingHours([]);
      return;
    }
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee?.workingHours) {
      setSelectedEmployeeWorkingHours(employee.workingHours);
    } else if (employeeId && employees.length > 0) {
      const fetchDetails = async () => {
        setLoading(true);
        try {
          const details = await EmployeesAPI.getEmployeeById(employeeId);
          setSelectedEmployeeWorkingHours(details?.workingHours || []);
        } catch (err) {
          console.error('Error fetching employee details:', err);
          setSelectedEmployeeWorkingHours([]);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [employeeId, employees]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!customerId || !serviceId || !employeeId || !appointmentDate || !appointmentTime) {
      setError('Lütfen tüm gerekli alanları doldurun.');
      return;
    }
    setLoading(true);
    setError(null);

    const [hours, minutes] = appointmentTime.split(':').map(Number);
    const startTime = new Date(appointmentDate);
    startTime.setHours(hours, minutes, 0, 0);

    const appointmentData: any = {
      customerId,
      serviceId,
      employeeId,
      startTime: startTime.toISOString(),
      notes,
    };

    if (isPro && customerMessage) {
      appointmentData.customerMessage = customerMessage;
    }

    try {
      if (isEditMode && appointmentToEdit) {
        await dispatch(updateAppointment({ id: appointmentToEdit.id, ...appointmentData })).unwrap();
      } else {
        await dispatch(createAppointment(appointmentData)).unwrap();
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(`Appointment submission error (edit: ${isEditMode}):`, err);
      setError(`Randevu ${isEditMode ? 'güncellenemedi' : 'oluşturulamadı'}.`);
    } finally {
      setLoading(false);
    }
  }, [
    dispatch, customerId, serviceId, employeeId, appointmentDate, appointmentTime, notes, customerMessage, 
    isEditMode, appointmentToEdit, onSuccess, onClose, tenant?.id, isPro
  ]);

  return {
    formState: {
      customerId, setCustomerId,
      serviceId, setServiceId,
      employeeId, setEmployeeId,
      appointmentDate, setAppointmentDate,
      appointmentTime, setAppointmentTime,
      notes, setNotes,
      customerMessage, setCustomerMessage,
      currentCalendarMonth, setCurrentCalendarMonth,
    },
    dataState: {
      customers,
      services,
      employees,
      availableEmployees,
      selectedServiceDuration,
      selectedEmployeeWorkingHours,
    },
    uiState: {
      loading,
      error,
      isEditMode,
      isPro,
    },
    handleSubmit,
  };
}; 