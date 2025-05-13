import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { useParams, useNavigate } from 'react-router-dom';
import CustomersList from './CustomersList';
import CustomerDetail from './CustomerDetail';
import CustomerForm from './CustomerForm';
import AppLayout from '@/components/layouts/AppLayout';
import { clearSelectedCustomer, fetchCustomerById, fetchCustomers } from './customersSlice';
import { CustomerDto } from '@/types';

const Customers: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId?: string }>();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  
  // Load customer from URL parameter if available
  useEffect(() => {
    if (customerId) {
      setSelectedCustomerId(customerId);
      dispatch(fetchCustomerById(customerId));
    }
  }, [customerId, dispatch]);
  
  const handleSelectCustomer = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };
  
  const handleCreateAppointment = (customerId: string) => {
    // Navigate to appointments page with customer ID
    navigate(`/appointments/create/${customerId}`);
  };
  
  const handleBackToList = () => {
    navigate('/customers');
    setSelectedCustomerId(null);
    dispatch(clearSelectedCustomer());
  };
  
  const handleAddCustomer = () => {
    setShowAddCustomerModal(true);
  };
  
  const handleCustomerAdded = (customer: CustomerDto) => {
    setShowAddCustomerModal(false);
    // Refresh the customers list
    dispatch(fetchCustomers({
      pageNumber: 1
    }));
    // Navigate to the new customer
    navigate(`/customers/${customer.id}`);
  };
  
  const handleCancelAddCustomer = () => {
    setShowAddCustomerModal(false);
  };
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Customers
            </h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            {selectedCustomerId && (
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to List
              </button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* List - hidden on mobile when a customer is selected */}
          <div className={`lg:col-span-2 ${selectedCustomerId ? 'hidden lg:block' : ''}`}>
            <CustomersList 
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={handleAddCustomer}
            />
          </div>
          
          {/* Details - shows on all screens when a customer is selected */}
          <div className={`lg:col-span-3 ${selectedCustomerId ? '' : 'hidden lg:block'}`}>
            <CustomerDetail onCreateAppointment={handleCreateAppointment} />
          </div>
        </div>
      </div>
      
      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full md:max-w-3xl">
              <CustomerForm 
                onSuccess={handleCustomerAdded} 
                onCancel={handleCancelAddCustomer} 
              />
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Customers; 