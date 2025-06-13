import { FC, useState, useCallback, Fragment, ChangeEvent } from 'react';
import { FiUser, FiPlus, FiSearch, FiFilter, FiPhone, FiMail, FiClock, FiTrash2, FiEdit, FiX, FiChevronRight, FiBriefcase } from 'react-icons/fi';
import { EmployeesListProps, EMPLOYEE_SORT_OPTIONS, formatEmployeeName, formatPhoneNumber, getWorkingDaysCount } from '../model';
import { useEmployeesFilters } from '../lib/hooks/useEmployeesFilters';
import { useGetEmployeesQuery, useDeleteEmployeeMutation } from '../api/employeesAPI';
import Button from '@/shared/ui/components/Button';
import Alert from '@/shared/ui/components/Alert';

const EmployeesList: FC<EmployeesListProps> = ({
  onSelectEmployee,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  isDetailViewActive = false,
  selectedEmployeeId
}) => {
  // Filter and pagination management
  const {
    filters,
    queryParams,
    setSearchString,
    setIsActive,
    handleSortChange,
    clearFilters,
    nextPage,
    prevPage,
    hasSearch,
    hasActiveFilter,
    isFirstPage
  } = useEmployeesFilters();

  // Local UI state
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchString);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // RTK Query hooks
  const {
    data: employeesData,
    isLoading,
    error,
    isFetching,
    refetch
  } = useGetEmployeesQuery(queryParams, {
    refetchOnMountOrArgChange: 30, // 30 seconds
    refetchOnFocus: true,
  });

  const [deleteEmployee, { isLoading: isDeletingEmployee }] = useDeleteEmployeeMutation();

  // Handle search input change
  const handleSearchInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);
    setSearchString(value); // This is debounced
  }, [setSearchString]);

  // Handle active filter change
  const handleActiveFilterChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setIsActive(value === 'all' ? undefined : value === 'true');
  }, [setIsActive]);

  // Handle delete employee
  const handleDeleteEmployee = useCallback(async (employeeId: string) => {
    try {
      await deleteEmployee(employeeId).unwrap();
      setShowDeleteConfirm(null);
      
      // Call parent handler if provided
      if (onDeleteEmployee) {
        onDeleteEmployee(employeeId);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      setShowDeleteConfirm(null);
    }
  }, [deleteEmployee, onDeleteEmployee]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    clearFilters();
  }, [clearFilters]);

  const employees = employeesData?.items || [];
  const pagination = employeesData ? {
    pageNumber: employeesData.pageNumber,
    totalPages: employeesData.totalPages,
    totalCount: employeesData.totalCount,
    hasNextPage: employeesData.hasNextPage,
    hasPreviousPage: employeesData.hasPreviousPage
  } : null;

  // Loading state
  if (isLoading && employees.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200"></div>
            <div className="w-12 h-12 rounded-full border-4 border-red-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-slate-600 font-medium">Personeller yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 shadow-lg">
        <Alert 
          type="error" 
          message="Personeller yüklenirken bir hata oluştu. Lütfen tekrar deneyin."
        />
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg overflow-hidden">
      {/* Modern Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personel Listesi</h2>
              <p className="text-sm text-slate-500">
                {pagination?.totalCount ? `${pagination.totalCount} personel` : 'Personel listesi'}
              </p>
            </div>
            {isFetching && employees.length > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-xs font-medium">Güncelleniyor</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
            >
              {isFetching ? (
                <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Yenile
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                showFilters 
                  ? 'bg-red-100 text-red-700 shadow-sm' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FiFilter className="w-4 h-4 mr-2" />
              {showFilters ? 'Filtreleri Gizle' : 'Filtrele'}
            </button>
            
            <button
              onClick={onAddEmployee}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-600 text-white font-medium text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Yeni Personel
            </button>
          </div>
        </div>
      </div>
      
      {/* Modern Filters */}
      {showFilters && (
        <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-200/60">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Ara
              </label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  placeholder="İsim, email veya telefon ile ara..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Durum
              </label>
              <select
                value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
                onChange={handleActiveFilterChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 text-sm"
              >
                <option value="all">Tümü</option>
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Sıralama
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortAscending ? 'asc' : 'desc'}`}
                onChange={(e) => {
                  const [field] = e.target.value.split('-');
                  handleSortChange(field);
                }}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 text-sm"
              >
                {EMPLOYEE_SORT_OPTIONS.map((option) => (
                  <Fragment key={option.value}>
                    <option value={`${option.value}-asc`}>{option.label} ({option.ascending})</option>
                    <option value={`${option.value}-desc`}>{option.label} ({option.descending})</option>
                  </Fragment>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 text-sm font-medium"
            >
              <FiX className="w-4 h-4 mr-2" />
              Filtreleri Temizle
            </button>
          </div>
        </div>
      )}
      
      {/* Modern Employee List */}
      <div className="divide-y divide-slate-200/60">
        {employees.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FiUser className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {hasSearch || hasActiveFilter ? 'Personel bulunamadı' : 'Henüz personel yok'}
            </h3>
            <p className="text-slate-500 mb-6">
              {hasSearch || hasActiveFilter
                ? 'Arama kriterlerinize uygun personel bulunamadı.' 
                : 'Başlamak için ilk personelinizi ekleyin.'
              }
            </p>
            {!hasSearch && !hasActiveFilter && (
              <button
                onClick={onAddEmployee}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                İlk Personeli Ekle
              </button>
            )}
          </div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className={`relative px-6 py-5 cursor-pointer transition-all duration-200 hover:bg-slate-50/50 group ${
                selectedEmployeeId === employee.id 
                  ? 'bg-red-50/50 border-r-4 border-red-500' 
                  : ''
              }`}
              onClick={() => onSelectEmployee && onSelectEmployee(employee.id)}
            >
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-md">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                  {selectedEmployeeId === employee.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* Employee Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-base font-semibold text-slate-900 truncate">
                      {formatEmployeeName(employee)}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      employee.isActive 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {employee.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-slate-500">
                    {employee.email && (
                      <div className="flex items-center">
                        <FiMail className="w-3.5 h-3.5 mr-1.5" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                    )}
                    {employee.phoneNumber && (
                      <div className="flex items-center">
                        <FiPhone className="w-3.5 h-3.5 mr-1.5" />
                        <span>{formatPhoneNumber(employee.phoneNumber)}</span>
                      </div>
                    )}
                    {employee.title && (
                      <div className="flex items-center">
                        <FiBriefcase className="w-3.5 h-3.5 mr-1.5" />
                        <span>{employee.title}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <FiClock className="w-3.5 h-3.5 mr-1.5" />
                      <span>{getWorkingDaysCount(employee)} gün</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {onEditEmployee && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEmployee(employee.id);
                      }}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all duration-200"
                    >
                      <FiEdit className="w-4 h-4 text-slate-600" />
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(employee.id);
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-200 transition-all duration-200"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-600" />
                  </button>
                  
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-red-100 transition-colors duration-200">
                    <FiChevronRight className="w-3 h-3 text-slate-400 group-hover:text-red-600" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Modern Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-medium">{pagination.totalCount}</span> personel
              <span className="ml-2">
                (Sayfa <span className="font-medium">{pagination.pageNumber}</span> / 
                <span className="font-medium">{pagination.totalPages}</span>)
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={prevPage}
                disabled={isFirstPage || isFetching}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isFirstPage || isFetching
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-sm'
                }`}
              >
                Önceki
              </button>
              <button
                onClick={nextPage}
                disabled={!pagination.hasNextPage || isFetching}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  !pagination.hasNextPage || isFetching
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-sm'
                }`}
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modern Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Personeli Sil</h3>
                <p className="text-sm text-slate-500">Bu işlem geri alınamaz</p>
              </div>
            </div>
            
            <p className="text-slate-600 mb-8">
              Bu personeli silmek istediğinizden emin misiniz? Personele ait tüm bilgiler silinecektir.
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeletingEmployee}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors duration-200"
              >
                İptal
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDeleteEmployee(showDeleteConfirm)}
                disabled={isDeletingEmployee}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isDeletingEmployee ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesList;