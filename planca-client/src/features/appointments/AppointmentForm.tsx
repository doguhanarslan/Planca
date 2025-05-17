import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';
import { CustomerDto, ServiceDto, EmployeeDto, AppointmentDto } from '../../types';
import { createAppointment, updateAppointment } from './appointmentsSlice';
import { AppDispatch, RootState } from '../../app/store';
import CustomersAPI from '../customers/customersAPI';
import ServicesAPI from '../services/servicesAPI';
import EmployeesAPI from '../employees/employeesAPI';
import { FiCalendar, FiClock, FiUser, FiTool, FiBriefcase, FiMessageSquare } from 'react-icons/fi';

interface AppointmentFormProps {
  selectedDate: Date;
  onClose: () => void;
  onSuccess?: () => void;
  appointmentToEdit?: AppointmentDto | null;
}

const AppointmentForm = ({ selectedDate, onClose, onSuccess, appointmentToEdit }: AppointmentFormProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const tenant = useSelector((state: RootState) => state.auth.tenant);
  const isPro = tenant && tenant.subscriptionType === 'Pro';
  const isEditMode = Boolean(appointmentToEdit);
  
  // Form state
  const [customerId, setCustomerId] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    format(selectedDate, 'yyyy-MM-dd')
  );
  const [appointmentTime, setAppointmentTime] = useState<string>('09:00');
  const [notes, setNotes] = useState<string>('');
  const [customerMessage, setCustomerMessage] = useState<string>('');
  
  // Data state
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load customers and services when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const customersResponse = await CustomersAPI.getCustomers({
          pageSize: 100, // Get a reasonable number of customers
          sortBy: 'LastName'
        });
        
        const servicesResponse = await ServicesAPI.getServices({
          isActive: true,
          sortBy: 'Name',
          tenantId: tenant?.id // Pass the tenant ID to fix the warning
        });
        
        setCustomers(customersResponse.items || []);
        setServices(servicesResponse.data?.items || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load necessary data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tenant?.id]); // Add tenant?.id to the dependency array
  
  // Load employees when a service is selected
  useEffect(() => {
    if (serviceId) {
      const fetchEmployees = async () => {
        setLoading(true);
        try {
          const employeesData = await EmployeesAPI.getEmployeesByService(serviceId, tenant?.id);
          setAvailableEmployees(employeesData);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching employees:', error);
          setError('Failed to load employees for the selected service');
          setLoading(false);
        }
      };
      
      fetchEmployees();
    } else {
      setAvailableEmployees([]);
    }
  }, [serviceId, tenant?.id]); // Add tenant?.id to dependency array
  
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
        setAppointmentDate(format(appointmentDateTime, 'yyyy-MM-dd'));
        setAppointmentTime(format(appointmentDateTime, 'HH:mm'));
      }
      
      // Set notes
      if (appointmentToEdit.notes) {
        setNotes(appointmentToEdit.notes);
      }
    }
  }, [appointmentToEdit]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || !serviceId || !employeeId || !appointmentDate || !appointmentTime) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Combine date and time to create startTime
      const startTime = new Date(`${appointmentDate}T${appointmentTime}`).toISOString();
      
      const appointmentData = {
        customerId,
        serviceId,
        employeeId,
        startTime,
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
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} appointment:`, error);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} appointment`);
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {isEditMode ? 'Edit Appointment' : 'Create New Appointment'}
      </h2>
      
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
                <FiUser className="mr-2" />
                Customer
              </div>
            </label>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </option>
              ))}
            </select>
          </div>
          
          {/* Service Selection */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiTool className="mr-2" />
                Service
              </div>
            </label>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setEmployeeId(''); // Reset employee when service changes
              }}
              required
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} (${service.price})
                </option>
              ))}
            </select>
          </div>
          
          {/* Employee Selection */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiBriefcase className="mr-2" />
                Employee
              </div>
            </label>
            <select
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              disabled={!serviceId || availableEmployees.length === 0}
            >
              <option value="">Select an employee</option>
              {availableEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
            {serviceId && availableEmployees.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                No employees available for this service
              </p>
            )}
          </div>
          
          {/* Appointment Date */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiCalendar className="mr-2" />
                Date
              </div>
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />
          </div>
          
          {/* Appointment Time */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiClock className="mr-2" />
                Time
              </div>
            </label>
            <input
              type="time"
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              required
            />
          </div>
          
          {/* Notes */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FiMessageSquare className="mr-2" />
                Notes
              </div>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this appointment"
            />
          </div>
          
          {/* Customer Message (Pro feature) */}
          {isPro && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <FiMessageSquare className="mr-2" />
                  Customer Message
                </div>
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                placeholder="Message to send to the customer"
              />
              <p className="text-xs text-gray-500 mt-1">
                This message will be sent to the customer (Pro feature)
              </p>
            </div>
          )}
        </div>
        
        {/* Form Actions */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm; 