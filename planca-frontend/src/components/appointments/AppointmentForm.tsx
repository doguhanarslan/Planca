// src/components/appointments/AppointmentForm.tsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '@/services/api';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  color: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}

interface AppointmentFormData {
  customerId: string;
  employeeId: string;
  serviceId: string;
  startTime: Date;
  notes: string;
}

const AppointmentForm: React.FC = () => {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<AppointmentFormData>();
  
  const serviceId = watch('serviceId');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, these would be actual API calls
        // const servicesResponse = await api.get('/services');
        // const employeesResponse = await api.get('/employees');
        
        // Placeholder data
        setServices([
          { id: '1', name: 'Haircut', description: 'Basic haircut', price: 30, durationMinutes: 30, isActive: true, color: '#3498db' },
          { id: '2', name: 'Hair Coloring', description: 'Full hair coloring', price: 80, durationMinutes: 120, isActive: true, color: '#e74c3c' },
          { id: '3', name: 'Manicure', description: 'Basic manicure', price: 25, durationMinutes: 45, isActive: true, color: '#9b59b6' },
        ]);
        
        setEmployees([
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', fullName: 'John Doe' },
          { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', fullName: 'Jane Smith' },
          { id: '3', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', fullName: 'Bob Johnson' },
        ]);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter employees based on selected service
  useEffect(() => {
    if (!serviceId || !employees.length) {
      setFilteredEmployees(employees);
      return;
    }
    
    // In a real app, you'd fetch employees who can provide this service
    // const fetchEmployeesForService = async () => {
    //   const response = await api.get(`/employees/service/${serviceId}`);
    //   setFilteredEmployees(response.data);
    // };
    
    // fetchEmployeesForService();
    
    // For now, just use all employees
    setFilteredEmployees(employees);
  }, [serviceId, employees]);
  
  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // await api.post('/appointments', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Book an Appointment</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="serviceId" className="block text-gray-700 text-sm font-medium mb-1">Service</label>
          <select
            id="serviceId"
            className={`w-full px-3 py-2 border rounded-md ${errors.serviceId ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            {...register('serviceId', { required: 'Service is required' })}
          >
            <option value="">Select a service</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - ${service.price} ({service.durationMinutes} min)
              </option>
            ))}
          </select>
          {errors.serviceId && <p className="text-red-500 text-xs mt-1">{errors.serviceId.message}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="employeeId" className="block text-gray-700 text-sm font-medium mb-1">Staff Member</label>
          <select
            id="employeeId"
            className={`w-full px-3 py-2 border rounded-md ${errors.employeeId ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
            {...register('employeeId', { required: 'Staff member is required' })}
            disabled={!serviceId}
          >
            <option value="">Select a staff member</option>
            {filteredEmployees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.fullName}
              </option>
            ))}
          </select>
          {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId.message}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="startTime" className="block text-gray-700 text-sm font-medium mb-1">Date & Time</label>
          <Controller
            control={control}
            name="startTime"
            rules={{ required: 'Date and time are required' }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date) => field.onChange(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className={`w-full px-3 py-2 border rounded-md ${errors.startTime ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                placeholderText="Select date and time"
                minDate={new Date()}
                filterTime={(time) => {
                  const hours = time.getHours();
                  return hours >= 9 && hours < 18; // 9 AM to 6 PM
                }}
              />
            )}
          />
          {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
        </div>
        
        <div className="mb-6">
          <label htmlFor="notes" className="block text-gray-700 text-sm font-medium mb-1">Notes (Optional)</label>
          <textarea
            id="notes"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Any special requests or additional information..."
            {...register('notes')}
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Scheduling...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;