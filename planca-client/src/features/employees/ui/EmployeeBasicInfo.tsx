import { useState } from 'react';
import * as React from 'react';
import { EmployeeDto } from '@/shared/types';
import { useUpdateEmployeeMutation } from '../api/employeesAPI';
import { useGetActiveServicesQuery } from '@/features/services/api/servicesAPI';

interface EmployeeBasicInfoProps {
  employee: EmployeeDto;
}

const EmployeeBasicInfo: React.FC<EmployeeBasicInfoProps> = ({ employee }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phoneNumber: employee.phoneNumber || '',
    title: employee.title || '',
    isActive: employee.isActive,
    serviceIds: employee.serviceIds || [],
  });

  // RTK Query hooks
  const [updateEmployee, { isLoading: isUpdating, error: updateError }] = useUpdateEmployeeMutation();
  const { data: services = [], isLoading: servicesLoading } = useGetActiveServicesQuery();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: checked
        ? [...prev.serviceIds, serviceId]
        : prev.serviceIds.filter(id => id !== serviceId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateEmployee({
        ...employee,
        ...formData,
      }).unwrap();
      
      setEditMode(false);
    } catch (error) {
      console.error('Employee update failed:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber || '',
      title: employee.title || '',
      isActive: employee.isActive,
      serviceIds: employee.serviceIds || [],
    });
    setEditMode(false);
  };

  if (editMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Personel Bilgilerini Düzenle</h3>
        </div>

        {updateError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Personel güncellenirken bir hata oluştu.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Ad
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                required
                disabled={isUpdating}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Soyad
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                required
                disabled={isUpdating}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-posta
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
              required
              disabled={isUpdating}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Telefon
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                disabled={isUpdating}
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Unvan
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                disabled={isUpdating}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              disabled={isUpdating}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Aktif
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hizmetler
            </label>
            {servicesLoading ? (
              <div className="text-sm text-gray-500">Hizmetler yükleniyor...</div>
            ) : (
              <div className="space-y-2">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      checked={formData.serviceIds.includes(service.id)}
                      onChange={(e) => handleServiceChange(service.id, e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      disabled={isUpdating}
                    />
                    <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-gray-900">
                      {service.name}
                    </label>
                  </div>
                ))}
                {services.length === 0 && (
                  <div className="text-sm text-gray-500">Henüz hizmet eklenmemiş.</div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={isUpdating}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              disabled={isUpdating}
            >
              {isUpdating ? 'Güncelleniyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Personel Bilgileri</h3>
        <button
          onClick={() => setEditMode(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Düzenle
        </button>
      </div>

      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">Ad Soyad</dt>
          <dd className="mt-1 text-sm text-gray-900">{employee.fullName}</dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500">E-posta</dt>
          <dd className="mt-1 text-sm text-gray-900">{employee.email}</dd>
        </div>

        {employee.phoneNumber && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Telefon</dt>
            <dd className="mt-1 text-sm text-gray-900">{employee.phoneNumber}</dd>
          </div>
        )}

        {employee.title && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Unvan</dt>
            <dd className="mt-1 text-sm text-gray-900">{employee.title}</dd>
          </div>
        )}

        <div>
          <dt className="text-sm font-medium text-gray-500">Durum</dt>
          <dd className="mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              employee.isActive 
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {employee.isActive ? 'Aktif' : 'Pasif'}
            </span>
          </dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="text-sm font-medium text-gray-500">Hizmetler</dt>
          <dd className="mt-1">
            {employee.serviceIds && employee.serviceIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {services
                  .filter(service => employee.serviceIds.includes(service.id))
                  .map(service => (
                    <span
                      key={service.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {service.name}
                    </span>
                  ))}
              </div>
            ) : (
              <span className="text-sm text-gray-500">Henüz hizmet atanmamış</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
};

export default EmployeeBasicInfo;