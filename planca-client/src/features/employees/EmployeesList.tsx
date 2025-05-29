import React, { useState, useMemo } from 'react';
import { EmployeeDto } from '@/shared/types';
import { FaSort, FaSortUp, FaSortDown, FaPlus, FaEdit, FaTrash, FaFilter, FaUndo, FaUser, FaClock, FaEnvelope, FaPhone } from 'react-icons/fa';
import Alert from '@/shared/ui/components/Alert';
import EmployeeForm from './EmployeeForm';

// RTK Query hooks
import {
  useGetEmployeesQuery,
  useDeleteEmployeeMutation
} from './api/employeesAPI';

interface EmployeesListProps {
  onNewEmployeeClick?: () => void;
}

const EmployeesList: React.FC<EmployeesListProps> = ({ onNewEmployeeClick }) => {
  // Local state for filters and UI
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
    searchString: '',
    isActive: undefined as boolean | undefined,
    sortBy: 'lastName',
    sortAscending: true,
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDto | null>(null);

  // RTK Query hooks
  const {
    data: employeesData,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetEmployeesQuery(filters, {
    // Refetch on mount if data is older than 5 minutes
    refetchOnMountOrArgChange: 300,
    // Refetch on window focus
    refetchOnFocus: true,
  });

  const [deleteEmployee, { 
    isLoading: isDeleting 
  }] = useDeleteEmployeeMutation();

  // Memoized computed values
  const { employees, totalCount, pageNumber, totalPages, isFiltered } = useMemo(() => {
    if (!employeesData) {
      return {
        employees: [],
        totalCount: 0,
        pageNumber: 1,
        totalPages: 1,
        isFiltered: false,
      };
    }

    return {
      employees: employeesData.items || [],
      totalCount: employeesData.totalCount || 0,
      pageNumber: employeesData.pageNumber || 1,
      totalPages: employeesData.totalPages || 1,
      isFiltered: !!(filters.searchString || filters.isActive !== undefined),
    };
  }, [employeesData, filters]);

  // Handle sorting
  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortAscending: prev.sortBy === field ? !prev.sortAscending : true,
      pageNumber: 1, // Reset to first page when sorting
    }));
  };

  // Render sort icon
  const renderSortIcon = (field: string) => {
    if (filters.sortBy !== field) {
      return <FaSort className="ml-1 text-gray-400" />;
    }
    return filters.sortAscending ? 
      <FaSortUp className="ml-1 text-primary-600" /> : 
      <FaSortDown className="ml-1 text-primary-600" />;
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, pageNumber: newPage }));
    }
  };

  // Handle filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      searchString: e.target.value,
      pageNumber: 1, // Reset to first page when searching
    }));
  };

  const handleActiveFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      isActive: value === 'all' ? undefined : value === 'true',
      pageNumber: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 10,
      searchString: '',
      isActive: undefined,
      sortBy: 'lastName',
      sortAscending: true,
    });
  };

  // Handle delete employee
  const handleDeleteClick = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteEmployee(showDeleteConfirm).unwrap();
        setShowDeleteConfirm(null);
      } catch (error) {
        console.error('Delete failed:', error);
        // Error will be handled by RTK Query automatically
      }
    }
  };

  // Handle edit employee
  const handleEditClick = (employee: EmployeeDto) => {
    setSelectedEmployee(employee);
    setEditModalOpen(true);
  };

  // Handle new employee
  const handleNewEmployeeClick = () => {
    if (onNewEmployeeClick) {
      onNewEmployeeClick();
    } else {
      setSelectedEmployee(null);
      setEditModalOpen(true);
    }
  };

  // Handle form close/success
  const handleFormClose = () => {
    setEditModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleFormSuccess = () => {
    setEditModalOpen(false);
    setSelectedEmployee(null);
    // RTK Query will automatically invalidate and refetch data
  };

  // Get working days count for an employee
  const getWorkingDaysCount = (employee: EmployeeDto): number => {
    if (!employee.workingHours || employee.workingHours.length === 0) {
      return 0;
    }
    return employee.workingHours.filter(wh => wh.isWorkingDay).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with filters and actions */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-semibold text-black">
          Personeller
          {isFiltered && (
            <span className="ml-2 text-xs bg-red-100 text-red-800 py-1 px-2 rounded-full">
              Filtreli
            </span>
          )}
          {isFetching && !isLoading && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
              Güncelleniyor...
            </span>
          )}
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:cursor-pointer text-gray-700 rounded-md shadow-sm hover:bg-gray-200 duration-300 transition-all"
          >
            <FaFilter className="mr-1" />
            {showFilters ? 'Filtreleri Gizle' : 'Filtrele'}
          </button>
          
          <button
            onClick={handleNewEmployeeClick}
            className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:cursor-pointer text-white rounded-md shadow-sm hover:bg-red-900 duration-300 transition-all"
          >
            <FaPlus className="mr-1" />
            Yeni Personel
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Ara
              </label>
              <input
                id="search"
                type="text"
                value={filters.searchString}
                onChange={handleSearchChange}
                placeholder="Ad, soyad veya e-posta"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                Durum
              </label>
              <select
                id="isActive"
                value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
                onChange={handleActiveFilterChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="all">Tümü</option>
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-100 transition-colors"
            >
              <FaUndo className="mr-1" />
              Sıfırla
            </button>
            
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 transition-colors"
              disabled={isFetching}
            >
              {isFetching ? 'Yenileniyor...' : 'Yenile'}
            </button>
          </div>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <Alert 
          type="error" 
          message={
            'status' in error 
              ? `Error ${error.status}: ${JSON.stringify(error.data)}` 
              : error.message || 'Bir hata oluştu'
          } 
        />
      )}
      
      {/* Main content */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : !employees || employees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {isFiltered ? 'Filtrelere uygun personel bulunamadı.' : 'Henüz personel eklenmemiş.'}
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('firstName')}
                  >
                    <div className="flex items-center">
                      Ad
                      {renderSortIcon('firstName')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('lastName')}
                  >
                    <div className="flex items-center">
                      Soyad
                      {renderSortIcon('lastName')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    İletişim
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Görev
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Çalışma Günleri
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Durum
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee: EmployeeDto) => employee && (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <FaUser className="text-gray-500" size={16} />
                        </div>
                        <div className="text-sm font-medium text-black">
                          {employee.firstName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {employee.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center mb-1">
                          <FaEnvelope className="mr-2" size={12} />
                          <span className="truncate max-w-xs">{employee.email}</span>
                        </div>
                        {employee.phoneNumber && (
                          <div className="flex items-center">
                            <FaPhone className="mr-2" size={12} />
                            <span>{employee.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {employee.title || 'Personel'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-black">
                        <FaClock className="mr-2 text-gray-400" size={14} />
                        <span>{getWorkingDaysCount(employee)} gün</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employee.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(employee)}
                        className="text-red-600 hover:text-red-900 mr-3"
                        disabled={isDeleting}
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(employee.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isDeleting}
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Toplam <span className="font-medium">{totalCount}</span> personel
                    {totalPages > 1 && (
                      <span> (Sayfa <span className="font-medium">{pageNumber}</span> / <span className="font-medium">{totalPages}</span>)</span>
                    )}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pageNumber - 1)}
                    disabled={pageNumber <= 1 || isLoading}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      pageNumber <= 1 || isLoading
                      ? 'bg-gray-100 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50'
                    } border-gray-300 text-sm font-medium text-gray-500`}
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => handlePageChange(pageNumber + 1)}
                    disabled={pageNumber === totalPages || isLoading}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      pageNumber === totalPages || isLoading
                      ? 'bg-gray-100 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50'
                    } border-gray-300 text-sm font-medium text-gray-500`}
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personeli Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu personeli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit/Create Employee Modal */}
      {editModalOpen && (
        <EmployeeForm 
          selectedEmployee={selectedEmployee}
          onClose={handleFormClose} 
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default EmployeesList;