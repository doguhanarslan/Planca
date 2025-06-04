import { useState } from 'react';
import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CustomersList, CustomerDetail, CustomerForm } from '@/features/customers/ui';
import { CustomerDto, CustomerStats } from '@/features/customers/model';
import { useGetCustomersQuery } from '@/features/customers/api';
import AppLayout from '@/shared/ui/layouts/AppLayout';
import { FiUsers, FiPlus, FiArrowLeft, FiTrendingUp, FiCalendar, FiStar, FiEdit } from 'react-icons/fi';

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId?: string }>();
  
  // Modal states
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<string | null>(null);
  
  // Detail view tracking
  const isDetailView = Boolean(customerId);
  
  // RTK Query for basic stats (using the first page with minimal params)
  const { data: customersData } = useGetCustomersQuery({ 
    pageNumber: 1, 
    pageSize: 1 
  }, {
    selectFromResult: ({ data, ...otherProps }) => ({
      data: data ? { totalCount: data.totalCount } : undefined,
      ...otherProps
    })
  });
  
  // Handle customer selection
  const handleSelectCustomer = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };
  
  // Handle create appointment
  const handleCreateAppointment = (customerId: string) => {
    navigate(`/appointments/create/${customerId}`);
  };
  
  // Handle close customer detail
  const handleCloseCustomerDetail = () => {
    navigate('/customers', { replace: true });
  };
  
  // Handle add customer
  const handleAddCustomer = () => {
    setShowAddCustomerModal(true);
  };
  
  // Handle customer added
  const handleCustomerAdded = (customer: CustomerDto) => {
    setShowAddCustomerModal(false);
    navigate(`/customers/${customer.id}`, { replace: true });
  };
  
  // Handle cancel add customer
  const handleCancelAddCustomer = () => {
    setShowAddCustomerModal(false);
  };

  // Handle edit customer
  const handleEditCustomer = (customerId: string) => {
    setCustomerToEdit(customerId);
    setShowEditCustomerModal(true);
  };

  // Handle delete customer
  const handleDeleteCustomer = (customerId: string) => {
    // Navigate back to customers list if the deleted customer was selected
    if (customerId === customerId) {
      navigate('/customers', { replace: true });
    }
  };

  // Handle customer edited
  const handleCustomerEdited = (customer: CustomerDto) => {
    setShowEditCustomerModal(false);
    setCustomerToEdit(null);
    // Stay on current customer view
  };

  // Handle cancel edit customer
  const handleCancelEditCustomer = () => {
    setShowEditCustomerModal(false);
    setCustomerToEdit(null);
  };

  // Get customer stats (you can make this more sophisticated with separate queries)
  const customerStats: CustomerStats = {
    total: customersData?.totalCount || 0,
    growth: '+12%', // This would come from a separate API call
    activeToday: 5, // This would come from a separate API call
    avgRating: 4.8 // This would come from a separate API call
  };
  
  return (
    <AppLayout>
      {/* Modern Page Header */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            {/* Header Content */}
            <div className="flex items-center space-x-6">
              {isDetailView && (
                <button
                  onClick={handleCloseCustomerDetail}
                  className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <FiArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              
              
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-4">
              {!isDetailView && (
                <button
                  onClick={handleAddCustomer}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  Yeni Müşteri
                </button>
              )}
            </div>
          </div>
          
          {/* Stats Cards - Only show on list view */}
          {!isDetailView && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Toplam Müşteri</p>
                    <p className="text-2xl font-bold text-slate-900">{customerStats.total}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <FiUsers className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <span className="text-green-600 text-sm font-medium">{customerStats.growth}</span>
                  <span className="text-slate-500 text-sm ml-2">bu ay</span>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Bugün Aktif</p>
                    <p className="text-2xl font-bold text-slate-900">{customerStats.activeToday}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <FiTrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <span className="text-green-600 text-sm font-medium">+2</span>
                  <span className="text-slate-500 text-sm ml-2">dünden</span>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Yaklaşan Randevu</p>
                    <p className="text-2xl font-bold text-slate-900">12</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <span className="text-amber-600 text-sm font-medium">Bu hafta</span>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Ortalama Puan</p>
                    <p className="text-2xl font-bold text-slate-900">{customerStats.avgRating}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <FiStar className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center mt-3">
                  <span className="text-red-600 text-sm font-medium">Mükemmel</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`grid gap-8 transition-all duration-300 ${
          isDetailView 
            ? 'lg:grid-cols-12' 
            : 'grid-cols-1'
        }`}>
          {/* Customer List */}
          <div className={`${
            isDetailView 
              ? 'lg:col-span-5 xl:col-span-4' 
              : 'col-span-1'
          } transition-all duration-300`}>
            <CustomersList 
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={handleAddCustomer}
              onEditCustomer={handleEditCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              isDetailViewActive={isDetailView}
              selectedCustomerId={customerId || null}
            />
          </div>
          
          {/* Customer Detail */}
          {isDetailView && (
            <div className="lg:col-span-7 xl:col-span-8 animate-in slide-in-from-right-5 duration-300">
              <CustomerDetail 
                customerId={customerId || null}
                onCreateAppointment={handleCreateAppointment}
                onClose={handleCloseCustomerDetail}
                onEditCustomer={handleEditCustomer}
                onDeleteCustomer={handleDeleteCustomer}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Modern Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={handleCancelAddCustomer}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-sm shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-white" />
              
              <div className="relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/60">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                      <FiPlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Yeni Müşteri</h2>
                      <p className="text-sm text-slate-600">Yeni müşteri bilgilerini girin</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCancelAddCustomer}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
                  >
                    <FiPlus className="w-5 h-5 text-slate-400 rotate-45" />
                  </button>
                </div>
                
                {/* Form Content */}
                <CustomerForm 
                  onSuccess={handleCustomerAdded} 
                  onCancel={handleCancelAddCustomer} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Edit Customer Modal */}
      {showEditCustomerModal && customerToEdit && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
              onClick={handleCancelEditCustomer}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-sm shadow-2xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-white" />
              
              <div className="relative">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200/60">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                      <FiEdit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Müşteri Düzenle</h2>
                      <p className="text-sm text-slate-600">Müşteri bilgilerini güncelleyin</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCancelEditCustomer}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200"
                  >
                    <FiPlus className="w-5 h-5 text-slate-400 rotate-45" />
                  </button>
                </div>
                
                {/* Form Content */}
                <CustomerForm 
                  customerId={customerToEdit}
                  onSuccess={handleCustomerEdited} 
                  onCancel={handleCancelEditCustomer} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Customers;