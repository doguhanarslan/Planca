import React, { useState } from 'react';
import { EmployeeDto } from '@/shared/types';
import { useUpdateEmployeeMutation } from './api/employeesAPI';

interface EmployeePermissionsProps {
  employee: EmployeeDto;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'appointments' | 'customers' | 'services' | 'reports' | 'settings';
  enabled: boolean;
}

const defaultPermissions: Permission[] = [
  {
    id: 'view_appointments',
    name: 'Randevuları Görüntüle',
    description: 'Tüm randevuları görüntüleyebilir',
    category: 'appointments',
    enabled: true,
  },
  {
    id: 'create_appointments',
    name: 'Randevu Oluştur',
    description: 'Yeni randevu oluşturabilir',
    category: 'appointments',
    enabled: false,
  },
  {
    id: 'edit_appointments',
    name: 'Randevu Düzenle',
    description: 'Mevcut randevuları düzenleyebilir',
    category: 'appointments',
    enabled: false,
  },
  {
    id: 'delete_appointments',
    name: 'Randevu Sil',
    description: 'Randevuları silebilir',
    category: 'appointments',
    enabled: false,
  },
  {
    id: 'view_customers',
    name: 'Müşterileri Görüntüle',
    description: 'Müşteri bilgilerini görüntüleyebilir',
    category: 'customers',
    enabled: true,
  },
  {
    id: 'create_customers',
    name: 'Müşteri Ekle',
    description: 'Yeni müşteri ekleyebilir',
    category: 'customers',
    enabled: false,
  },
  {
    id: 'edit_customers',
    name: 'Müşteri Düzenle',
    description: 'Müşteri bilgilerini düzenleyebilir',
    category: 'customers',
    enabled: false,
  },
  {
    id: 'view_services',
    name: 'Hizmetleri Görüntüle',
    description: 'Hizmet listesini görüntüleyebilir',
    category: 'services',
    enabled: true,
  },
  {
    id: 'manage_services',
    name: 'Hizmet Yönetimi',
    description: 'Hizmetleri oluşturabilir, düzenleyebilir ve silebilir',
    category: 'services',
    enabled: false,
  },
  {
    id: 'view_reports',
    name: 'Raporları Görüntüle',
    description: 'İş raporlarını ve analizleri görüntüleyebilir',
    category: 'reports',
    enabled: false,
  },
  {
    id: 'advanced_reports',
    name: 'Gelişmiş Raporlar',
    description: 'Detaylı analiz ve gelişmiş rapor özelliklerine erişebilir',
    category: 'reports',
    enabled: false,
  },
  {
    id: 'basic_settings',
    name: 'Temel Ayarlar',
    description: 'Temel sistem ayarlarını değiştirebilir',
    category: 'settings',
    enabled: false,
  },
  {
    id: 'admin_settings',
    name: 'Yönetici Ayarları',
    description: 'Tüm sistem ayarlarına erişebilir',
    category: 'settings',
    enabled: false,
  },
];

const categoryLabels = {
  appointments: 'Randevular',
  customers: 'Müşteriler',
  services: 'Hizmetler',
  reports: 'Raporlar',
  settings: 'Ayarlar',
};

const EmployeePermissions: React.FC<EmployeePermissionsProps> = ({ employee }) => {
  const [editMode, setEditMode] = useState(false);
  // Initialize permissions from employee data or use defaults
  const [permissions, setPermissions] = useState<Permission[]>(() => {
    // In a real app, you'd get permissions from employee.permissions
    // For now, we'll use defaults and simulate some enabled permissions
    return defaultPermissions.map(perm => ({
      ...perm,
      enabled: perm.id === 'view_appointments' || perm.id === 'view_customers' || perm.id === 'view_services',
    }));
  });

  // RTK Query hook
  const [updateEmployee, { isLoading: isUpdating, error: updateError }] = useUpdateEmployeeMutation();

  const handlePermissionChange = (permissionId: string, enabled: boolean) => {
    setPermissions(prev => 
      prev.map(perm => 
        perm.id === permissionId 
          ? { ...perm, enabled }
          : perm
      )
    );
  };

  const handleCategoryToggle = (category: string, enabled: boolean) => {
    setPermissions(prev => 
      prev.map(perm => 
        perm.category === category 
          ? { ...perm, enabled }
          : perm
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, you'd send permissions to the API
      // For now, we'll simulate an update
      await updateEmployee({
        ...employee,
        // permissions: permissions.filter(p => p.enabled).map(p => p.id),
      }).unwrap();
      
      setEditMode(false);
    } catch (error) {
      console.error('Permissions update failed:', error);
    }
  };

  const handleCancel = () => {
    // Reset permissions to original state
    setPermissions(defaultPermissions.map(perm => ({
      ...perm,
      enabled: perm.id === 'view_appointments' || perm.id === 'view_customers' || perm.id === 'view_services',
    })));
    setEditMode(false);
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (editMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Yetkileri Düzenle</h3>
        </div>

        {updateError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Yetkiler güncellenirken bir hata oluştu.</p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Dikkat:</strong> Bu özellik henüz geliştirme aşamasındadır. Yetkiler şu anda aktif değildir.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h4>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle(category, true)}
                    className="text-xs text-green-600 hover:text-green-800"
                    disabled={isUpdating}
                  >
                    Tümünü Aç
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle(category, false)}
                    className="text-xs text-red-600 hover:text-red-800"
                    disabled={isUpdating}
                  >
                    Tümünü Kapat
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {categoryPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={permission.enabled}
                        onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        disabled={isUpdating}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={permission.id} className="font-medium text-gray-700">
                        {permission.name}
                      </label>
                      <p className="text-gray-500">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

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
        <h3 className="text-lg font-medium text-gray-900">Yetkiler</h3>
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

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Geliştirme Aşamasında:</strong> Personel yetki sistemi henüz aktif değildir. Şu anda tüm personeller temel görüntüleme yetkilerine sahiptir.
            </p>
          </div>
        </div>
      </div>

      {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
        <div key={category} className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </h4>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {categoryPermissions.map((permission) => (
              <div key={permission.id} className="flex items-center">
                <div className={`flex-shrink-0 h-2 w-2 rounded-full mr-3 ${
                  permission.enabled ? 'bg-green-400' : 'bg-gray-300'
                }`}></div>
                <div className="text-sm">
                  <span className={`font-medium ${
                    permission.enabled ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {permission.name}
                  </span>
                  <p className="text-gray-500 text-xs">{permission.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center py-6 text-gray-500">
        <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="text-sm">
          Yetki sistemi tüm personeller için aynı temel erişim seviyesini sağlar.
        </p>
      </div>
    </div>
  );
};

export default EmployeePermissions;