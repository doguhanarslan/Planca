import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCustomerAppointments } from './customersSlice';
import { CustomerDto, AppointmentDto } from '@/types';
import { format, parseISO } from 'date-fns';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiClock, FiInfo, FiPlus } from 'react-icons/fi';

interface CustomerDetailProps {
  onCreateAppointment: (customerId: string) => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ onCreateAppointment }) => {
  const dispatch = useAppDispatch();
  const { selectedCustomer, customerAppointments, loading } = useAppSelector(state => state.customers);
  
  // Local state for appointments filter
  const [filterFutureOnly, setFilterFutureOnly] = useState(true);
  
  // Fetch customer appointments when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      dispatch(fetchCustomerAppointments({
        customerId: selectedCustomer.id,
        params: {
          futureOnly: filterFutureOnly,
          sortAscending: true
        }
      }));
    }
  }, [dispatch, selectedCustomer, filterFutureOnly]);
  
  if (!selectedCustomer) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <FiUser className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No customer selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select a customer from the list to view details
        </p>
      </div>
    );
  }
  
  const formatAddress = (customer: CustomerDto) => {
    if (!customer.address) return 'No address provided';
    
    const { street, city, state, zipCode, country } = customer.address;
    const parts = [street, city, state, zipCode, country].filter(Boolean);
    
    return parts.join(', ');
  };
  
  const formatAppointmentTime = (appointment: AppointmentDto) => {
    try {
      const start = parseISO(appointment.startTime);
      const end = parseISO(appointment.endTime);
      
      return {
        date: format(start, 'MMM d, yyyy'),
        time: `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
      };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { date: 'Invalid date', time: 'Invalid time' };
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleCreateAppointment = () => {
    onCreateAppointment(selectedCustomer.id);
  };
  
  const toggleFilter = () => {
    setFilterFutureOnly(!filterFutureOnly);
  };
  
  return (
    <div className="bg-white shadow rounded-lg">
      {/* Customer info header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
              <FiUser className="h-8 w-8 text-gray-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{selectedCustomer.fullName}</h2>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <FiMail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                <span>{selectedCustomer.email}</span>
              </div>
              {selectedCustomer.phoneNumber && (
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <FiPhone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span>{selectedCustomer.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleCreateAppointment}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiPlus className="mr-2 -ml-1 h-4 w-4" />
            New Appointment
          </button>
        </div>
        
        {/* Address section */}
        {selectedCustomer.address && (
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
            <span>{formatAddress(selectedCustomer)}</span>
          </div>
        )}
        
        {/* Notes section */}
        {selectedCustomer.notes && (
          <div className="mt-4 bg-gray-50 rounded-md p-3">
            <div className="flex items-start">
              <FiInfo className="flex-shrink-0 mt-0.5 mr-2 h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">{selectedCustomer.notes}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Appointments section */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
          <div>
            <button
              onClick={toggleFilter}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                filterFutureOnly
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {filterFutureOnly ? 'Upcoming Only' : 'All Appointments'}
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : customerAppointments.length === 0 ? (
          <div className="text-center py-8">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterFutureOnly
                ? 'No upcoming appointments for this customer.'
                : 'No appointments found for this customer.'}
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateAppointment}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                Schedule an appointment
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden bg-white rounded-md border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {customerAppointments.map((appointment) => {
                const { date, time } = formatAppointmentTime(appointment);
                return (
                  <li key={appointment.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FiCalendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{appointment.serviceName}</p>
                          <div className="flex items-center">
                            <div className="flex items-center mr-4">
                              <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <p className="text-sm text-gray-500">{date}</p>
                            </div>
                            <div className="flex items-center">
                              <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <p className="text-sm text-gray-500">{time}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 ml-8 text-sm text-gray-500">{appointment.notes}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail; 