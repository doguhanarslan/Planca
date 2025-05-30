import { useState, useMemo } from 'react';
import * as React from 'react';
import { ServiceDto } from '@/shared/types';
import { FaSort, FaSortUp, FaSortDown, FaPlus, FaEdit, FaTrash, FaFilter, FaUndo } from 'react-icons/fa';
import Alert from '@/shared/ui/components/Alert';
import ServiceForm from './ServiceForm';

// RTK Query hooks
import {
  useGetServicesQuery,
  useDeleteServiceMutation
} from './api/servicesAPI';

const ServicesList: React.FC = () => {
  // Local state for filters and UI
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
    searchString: '',
    isActive: undefined as boolean | undefined,
    maxPrice: undefined as number | undefined,
    sortBy: 'name',
    sortAscending: true,
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceDto | null>(null);

  // RTK Query hooks
  const {
    data: servicesData,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetServicesQuery(filters, {
    // Refetch on mount if data is older than 5 minutes
    refetchOnMountOrArgChange: 300,
    // Refetch on window focus
    refetchOnFocus: true,
  });

  const [deleteService, { 
    isLoading: isDeleting 
  }] = useDeleteServiceMutation();

  // Memoized computed values
  const { services, totalCount, pageNumber, totalPages, isFiltered } = useMemo(() => {
    if (!servicesData) {
      return {
        services: [],
        totalCount: 0,
        pageNumber: 1,
        totalPages: 1,
        isFiltered: false,
      };
    }

    return {
      services: servicesData.items || [],
      totalCount: servicesData.totalCount || 0,
      pageNumber: servicesData.pageNumber || 1,
      totalPages: servicesData.totalPages || 1,
      isFiltered: !!(filters.searchString || filters.isActive !== undefined || filters.maxPrice),
    };
  }, [servicesData, filters]);

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

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : undefined;
    setFilters(prev => ({
      ...prev,
      maxPrice: value,
      pageNumber: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 10,
      searchString: '',
      isActive: undefined,
      maxPrice: undefined,
      sortBy: 'name',
      sortAscending: true,
    });
  };

  // Handle delete service
  const handleDeleteClick = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteService(showDeleteConfirm).unwrap();
        setShowDeleteConfirm(null);
      } catch (error) {
        console.error('Delete failed:', error);
        // Error will be handled by RTK Query automatically
      }
    }
  };

  // Handle edit service
  const handleEditClick = (service: ServiceDto) => {
    setSelectedService(service);
    setEditModalOpen(true);
  };

  // Handle new service
  const handleNewServiceClick = () => {
    setSelectedService(null);
    setEditModalOpen(true);
  };

  // Handle form close/success
  const handleFormClose = () => {
    setEditModalOpen(false);
    setSelectedService(null);
  };

  const handleFormSuccess = () => {
    setEditModalOpen(false);
    setSelectedService(null);
    // RTK Query will automatically invalidate and refetch data
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with filters and actions */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-semibold text-black">
          Hizmetler
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
            onClick={handleNewServiceClick}
            className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:cursor-pointer text-white rounded-md shadow-sm hover:bg-red-900 duration-300 transition-all"
          >
            <FaPlus className="mr-1" />
            Yeni Hizmet
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
                value={filters.searchString}
                onChange={handleSearchChange}
                placeholder="Hizmet adı veya açıklama"
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
            
            <div>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
                Maksimum Fiyat
              </label>
              <input
                id="maxPrice"
                type="number"
                min="0"
                step="0.01"
                value={filters.maxPrice || ''}
                onChange={handleMaxPriceChange}
                placeholder="Maksimum fiyat"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
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
        ) : !services || services.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {isFiltered ? 'Filtrelere uygun hizmet bulunamadı.' : 'Henüz hizmet eklenmemiş.'}
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      İsim
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Açıklama
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Fiyat
                      {renderSortIcon('price')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('durationMinutes')}
                  >
                    <div className="flex items-center">
                      Süre
                      {renderSortIcon('durationMinutes')}
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
                {services.map((service: ServiceDto) => service && (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full mr-3" style={{ backgroundColor: service.color }}></div>
                        <div className="text-sm font-medium text-black">
                          {service.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {service.description || 'Açıklama yok'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {service.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black">
                        {service.durationMinutes} dakika
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {service.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(service)}
                        className="text-red-600 hover:text-red-900 mr-3"
                        disabled={isDeleting}
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(service.id)}
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
                    Toplam <span className="font-medium">{totalCount}</span> hizmet
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hizmeti Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu hizmeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
      
      {/* Edit/Create Service Modal */}
      {editModalOpen && (
        <ServiceForm 
          selectedService={selectedService}
          onClose={handleFormClose} 
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default ServicesList;