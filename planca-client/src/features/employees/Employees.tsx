import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchEmployeeById, selectSelectedEmployee, setSelectedEmployee } from './employeesSlice';
import AppLayout from '@/components/layouts/AppLayout';
import EmployeesList from './EmployeesList';
import EmployeeBasicInfo from './EmployeeBasicInfo';
import EmployeeWorkingHours from './EmployeeWorkingHours';
import EmployeePermissions from './EmployeePermissions';
import EmployeeForm from './EmployeeForm';

const Employees: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { employeeId } = useParams<{ employeeId: string }>();
  const selectedEmployee = useAppSelector(selectSelectedEmployee);
  const [activeTab, setActiveTab] = useState('basicInfo');
  
  // State for employee form modal
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  
  // Fetch employee details when ID changes
  useEffect(() => {
    if (employeeId) {
      dispatch(fetchEmployeeById(employeeId));
    } else {
      // Clear selected employee when on the main list view
      dispatch(setSelectedEmployee(null));
    }
  }, [dispatch, employeeId]);
  
  // Handle tab changes - just change the state, don't navigate
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  // Handle form close
  const handleFormClose = () => {
    setShowEmployeeForm(false);
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    setShowEmployeeForm(false);
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
        
        {/* Show employee form modal when showEmployeeForm is true */}
        {showEmployeeForm && (
          <EmployeeForm
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
        
        {employeeId && selectedEmployee ? (
          <div>
            {/* Employee details with tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-black">
                  {selectedEmployee.fullName}
                </h2>
                <p className="text-gray-500">{selectedEmployee.title || 'Personel'}</p>
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
                {activeTab === 'basicInfo' && <EmployeeBasicInfo employee={selectedEmployee} />}
                {activeTab === 'workingHours' && <EmployeeWorkingHours employee={selectedEmployee} />}
                {activeTab === 'permissions' && <EmployeePermissions employee={selectedEmployee} />}
              </div>
            </div>
            
            <button
              onClick={() => navigate('/employees')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
            >
              Listeye Dön
            </button>
          </div>
        ) : (
          <EmployeesList onNewEmployeeClick={() => setShowEmployeeForm(true)} />
        )}
      </div>
    </AppLayout>
  );
};

export default Employees; 