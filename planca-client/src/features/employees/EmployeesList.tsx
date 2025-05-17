import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { 
  fetchEmployees, 
  setPageNumber, 
  setSearchString, 
  setIsActive,
  setServiceId,
  setSortBy,
  setSortDirection,
  resetFilters,
  removeEmployee,
  setSelectedEmployee
} from './employeesSlice';
import { EmployeeDto } from '@/types';
import { FaSort, FaSortUp, FaSortDown, FaPlus, FaEdit, FaTrash, FaFilter, FaUndo } from 'react-icons/fa';
import Alert from '@/components/common/Alert';

interface EmployeesListProps {
  onNewEmployeeClick: () => void;
}

const EmployeesList: React.FC<EmployeesListProps> = ({ onNewEmployeeClick }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { 
    employees,
    loading,
    error,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    isFiltered,
    filters
  } = useAppSelector(state => state.employees);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load employees on component mount and when filters/pagination change
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch, pageNumber, pageSize, filters]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (filters.sortBy === field) {
      // Toggle direction if already sorting by this field
      dispatch(setSortDirection(!filters.sortAscending));
    } else {
      // Set new sort field and default to ascending
      dispatch(setSortBy(field));
      dispatch(setSortDirection(true));
    }
    dispatch(fetchEmployees());
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
      dispatch(setPageNumber(newPage));
    }
  };

  // Handle filter changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchString(e.target.value));
  };

  const handleActiveFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    dispatch(setIsActive(value === 'all' ? undefined : value === 'true'));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    dispatch(fetchEmployees());
  };

  // Handle delete employee
  const handleDeleteClick = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      await dispatch(removeEmployee(showDeleteConfirm));
      setShowDeleteConfirm(null);
    }
  };

  // Handle view/edit employee
  const handleViewEmployee = (employee: EmployeeDto) => {
    dispatch(setSelectedEmployee(employee));
    navigate(`/employees/${employee.id}`);
  };

  // Apply filters
  const applyFilters = () => {
    dispatch(fetchEmployees());
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
            onClick={onNewEmployeeClick}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Ara
              </label>
              <input
                id="search"
                type="text"
                value={filters.searchString || ''}
                onChange={handleSearchChange}
                placeholder="Ad, soyad, e-posta, ünvan..."
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
            
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center px-3 py-2 bg-gray-200 hover:cursor-pointer text-gray-700 rounded-md shadow-sm hover:bg-gray-300 duration-300 transition-all"
              >
                <FaUndo className="mr-1" />
                Filtreleri Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Employee list table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('FirstName')}
              >
                <div className="flex items-center">
                  Ad Soyad
                  {renderSortIcon('FirstName')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('Title')}
              >
                <div className="flex items-center">
                  Ünvan
                  {renderSortIcon('Title')}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('Email')}
              >
                <div className="flex items-center">
                  E-posta
                  {renderSortIcon('Email')}
                </div>
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
            {loading && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
                  </div>
                </td>
              </tr>
            )}
            
            {!loading && employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Personel bulunamadı.
                </td>
              </tr>
            )}
            
            {!loading && employees.map((employee: EmployeeDto) => (
              <tr key={employee.id} className="hover:bg-gray-50 cursor-pointer">
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  onClick={() => handleViewEmployee(employee)}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold">
                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.phoneNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  onClick={() => handleViewEmployee(employee)}
                >
                  <div className="text-sm text-gray-900">{employee.title || '-'}</div>
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  onClick={() => handleViewEmployee(employee)}
                >
                  <div className="text-sm text-gray-500">{employee.email}</div>
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap"
                  onClick={() => handleViewEmployee(employee)}
                >
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    employee.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewEmployee(employee);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(employee.id);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-700">
                Gösterilen <span className="font-medium">{Math.min(pageSize * (pageNumber - 1) + 1, totalCount)}</span> ile{' '}
                <span className="font-medium">{Math.min(pageSize * pageNumber, totalCount)}</span> arasında,{' '}
                toplam <span className="font-medium">{totalCount}</span> personel
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pageNumber === 1 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <span className="sr-only">Önceki</span>
                  &laquo;
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === pageNumber
                        ? 'bg-red-600 text-white border-red-600 z-10'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pageNumber === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <span className="sr-only">Sonraki</span>
                  &raquo;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaTrash className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Personeli Sil
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bu personeli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Sil
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <Alert
          type="error"
          message={error}
        />
      )}
    </div>
  );
};

export default EmployeesList; 