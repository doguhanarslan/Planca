import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { format, startOfDay } from 'date-fns';
import { CustomerDto, ServiceDto, EmployeeDto, AppointmentDto, WorkingHoursDto } from '../../../../shared/types';
import { RootState } from '../../../../app/store';
import CustomersAPI from '../../../customers/customersAPI';

// RTK Query hooks
import { 
  useCreateAppointmentMutation, 
  useUpdateAppointmentMutation 
} from '../../api/appointmentsAPI';
import { useGetActiveEmployeesQuery, useGetEmployeeByIdQuery } from '../../../employees/api/employeesAPI';

interface UseAppointmentFormProps {
  selectedDate: Date;
  appointmentToEdit?: AppointmentDto | null;
  onClose: () => void;
  onSuccess?: () => void;
  externalServices?: ServiceDto[];
  externalEmployees?: EmployeeDto[];
}

export const useAppointmentForm = ({
  selectedDate,
  appointmentToEdit,
  onClose,
  onSuccess,
  externalServices,
  externalEmployees,
}: UseAppointmentFormProps) => {
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
  const [employees, setEmployees] = useState<EmployeeDto[]>(externalEmployees || []);
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeDto[]>([]);
  const [selectedServiceDuration, setSelectedServiceDuration] = useState<number>(30);
  const [selectedEmployeeWorkingHours, setSelectedEmployeeWorkingHours] = useState<WorkingHoursDto[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // RTK Query hooks for employees
  const {
    data: employeesData = [],
    isLoading: employeesLoading,
    error: employeesError,
  } = useGetActiveEmployeesQuery(undefined, {
    // Skip if external employees are provided
    skip: Boolean(externalEmployees && externalEmployees.length > 0),
    refetchOnMountOrArgChange: 300,
  });

  // Get employee details for working hours
  const {
    data: employeeDetails,
    isLoading: employeeDetailsLoading,
    error: employeeDetailsError,
  } = useGetEmployeeByIdQuery(employeeId, {
    skip: !employeeId,
    refetchOnMountOrArgChange: 300,
  });

  // RTK Query mutations
  const [createAppointment, { 
    isLoading: isCreating, 
    error: createError 
  }] = useCreateAppointmentMutation();

  const [updateAppointment, { 
    isLoading: isUpdating, 
    error: updateError 
  }] = useUpdateAppointmentMutation();

  useEffect(() => {
    if (externalServices) {
      setServices(externalServices);
    }
  }, [externalServices]);

  useEffect(() => {
    if (externalEmployees && externalEmployees.length > 0) {
      setEmployees(externalEmployees);
      setAvailableEmployees(externalEmployees);
    } else if (employeesData && employeesData.length > 0) {
      setEmployees(employeesData);
      setAvailableEmployees(employeesData);
    }
  }, [externalEmployees, employeesData]);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const customerResponse = await CustomersAPI.getCustomers({ 
          pageSize: 100, 
          sortBy: 'LastName' 
        });

        if (customerResponse && customerResponse.items) {
          setCustomers(customerResponse.items);
        }
      } catch (err) {
        console.error('Form data loading error (customers):', err);
        setError('Müşteri verileri yüklenemedi.');
      }
      setLoading(false);
    };

    if (tenant?.id) {
      fetchCustomers();
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

    // Use RTK Query data if available
    if (employeeDetails?.workingHours) {
      setSelectedEmployeeWorkingHours(employeeDetails.workingHours);
    } else {
      // Fallback to employee data from list
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee?.workingHours) {
        setSelectedEmployeeWorkingHours(employee.workingHours);
      } else {
        setSelectedEmployeeWorkingHours([]);
      }
    }
  }, [employeeId, employees, employeeDetails]);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!customerId || !serviceId || !employeeId || !appointmentDate || !appointmentTime) {
      setError('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

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
      tenantId: tenant?.id || '',
    };

    if (isPro && customerMessage) {
      appointmentData.customerMessage = customerMessage;
    }

    try {
      if (isEditMode && appointmentToEdit) {
        // Update existing appointment
        await updateAppointment({ 
          id: appointmentToEdit.id, 
          ...appointmentData 
        }).unwrap();
      } else {
        // Create new appointment
        await createAppointment(appointmentData).unwrap();
      }
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(`Appointment submission error (edit: ${isEditMode}):`, err);
      
      // Extract error message from RTK Query error
      let errorMessage = `Randevu ${isEditMode ? 'güncellenemedi' : 'oluşturulamadı'}.`;
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.errors && Array.isArray(err.data.errors)) {
        errorMessage = err.data.errors.join(', ');
      } else if (typeof err?.data === 'string') {
        errorMessage = err.data;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  }, [
    customerId, serviceId, employeeId, appointmentDate, appointmentTime, notes, customerMessage,
    isEditMode, appointmentToEdit, onSuccess, onClose, tenant?.id, isPro,
    createAppointment, updateAppointment
  ]);

  // Combine loading states
  const isLoadingData = loading || employeesLoading || employeeDetailsLoading || isCreating || isUpdating;
  
  // Combine errors
  const combinedError = error || 
    (employeesError ? 'Personeller yüklenirken bir hata oluştu' : null) ||
    (employeeDetailsError ? 'Personel detayları yüklenirken bir hata oluştu' : null) ||
    (createError ? 'Randevu oluşturulurken bir hata oluştu' : null) ||
    (updateError ? 'Randevu güncellenirken bir hata oluştu' : null);

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
      loading: isLoadingData,
      error: combinedError,
      isEditMode,
      isPro,
    },
    handleSubmit,
  };
};