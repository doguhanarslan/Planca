import { useState } from 'react';
import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/shared/ui/layouts/AppLayout';
import EmployeesList from '@/features/employees/EmployeesList';
import EmployeeBasicInfo from '@/features/employees/EmployeeBasicInfo';
import EmployeeWorkingHours from '@/features/employees/EmployeeWorkingHours';
import EmployeePermissions from '@/features/employees/EmployeePermissions';
import EmployeeForm from '@/features/employees/EmployeeForm';
import { EmployeeDto } from '@/shared/types';

// RTK Query hooks
import {
  useGetEmployeeByIdQuery,
} from '@/features/employees/api/employeesAPI';

const Employees: React.FC = () => {
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const [activeTab, setActiveTab] = useState('basicInfo');
  
  // State for employee form modal
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeDto | null>(null);
  
  // RTK Query for fetching employee details
  const {
    data: selectedEmployee,
    error,
    isLoading,
    refetch
  } = useGetEmployeeByIdQuery(employeeId || '', {
    // Only fetch if employeeId exists
    skip: !employeeId,
    // Refetch on mount if data is older than 2 minutes
    refetchOnMountOrArgChange: 120,
  });
  
  // Handle tab changes - just change the state, don't navigate
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Handle form close
  const handleFormClose = () => {
    setShowEmployeeForm(false);
    setEmployeeToEdit(null);
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    setShowEmployeeForm(false);
    setEmployeeToEdit(null);
    // Refetch employee data if we're viewing a specific employee
    if (employeeId) {
      refetch();
    }
  };

  // Handle employee selection from list
  const handleEmployeeSelect = (employeeId: string) => {
    navigate(`/employees/${employeeId}`);
  };

  // Handle new employee click
  const handleNewEmployeeClick = () => {
    setEmployeeToEdit(null);
    setShowEmployeeForm(true);
  };

  // Handle edit employee from list - DÜZELTME: Modal açma
  const handleEditEmployeeFromList = (employee: EmployeeDto) => {
    setEmployeeToEdit(employee);
    setShowEmployeeForm(true);
  };
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-black mb-6">
          Personel Yönetimi
        </h1>
        <p className="text-gray-600 mb-8">
          İşletmenizin personellerini yönetin, personel bilgilerini güncelleyin ve çalışma saatlerini belirleyin.
        </p>
        
        {/* Employee form modal */}
        {showEmployeeForm && (
          <EmployeeForm
            selectedEmployee={employeeToEdit}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
        
        {employeeId && selectedEmployee ? (
          <div>
            {/* Employee details with tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              {/* Employee Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-black">
                      {selectedEmployee.fullName}
                    </h2>
                    <p className="text-gray-500">{selectedEmployee.title || 'Personel'}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {selectedEmployee.email}
                      </span>
                      {selectedEmployee.phoneNumber && (
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {selectedEmployee.phoneNumber}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedEmployee.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedEmployee.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    {/* Edit button for opening modal */}
                    <button
                      onClick={() => handleEditEmployeeFromList(selectedEmployee)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Düzenle
                    </button>
                    
                    {/* Refresh Button */}
                    <button
                      onClick={() => refetch()}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      Yenile
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => handleTabChange('basicInfo')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'basicInfo'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Personel Bilgileri
                  </button>
                  <button
                    onClick={() => handleTabChange('workingHours')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'workingHours'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Çalışma Saatleri
                  </button>
                  <button
                    onClick={() => handleTabChange('permissions')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'permissions'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Yetkiler
                  </button>
                </nav>
              </div>
              
              {/* Tab content */}
              <div className="p-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Personel bilgileri yüklenemedi</h3>
                    <p className="text-gray-500 mb-4">Personel bilgilerini yüklerken bir hata oluştu.</p>
                    <button
                      onClick={() => refetch()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Tekrar Dene
                    </button>
                  </div>
                ) : (
                  <>
                    {activeTab === 'basicInfo' && <EmployeeBasicInfo employee={selectedEmployee} />}
                    {activeTab === 'workingHours' && <EmployeeWorkingHours employee={selectedEmployee} />}
                    {activeTab === 'permissions' && <EmployeePermissions employee={selectedEmployee} />}
                  </>
                )}
              </div>
            </div>
            
            <button
              onClick={() => navigate('/employees')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Listeye Dön
            </button>
          </div>
        ) : (
          <EmployeesList 
            onNewEmployeeClick={handleNewEmployeeClick}
            onEditEmployee={handleEditEmployeeFromList}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Employees;