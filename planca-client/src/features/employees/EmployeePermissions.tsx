import React from 'react';
import { EmployeeDto } from '@/types';
import Alert from '@/components/common/Alert';

interface EmployeePermissionsProps {
  employee: EmployeeDto;
}

const EmployeePermissions: React.FC<EmployeePermissionsProps> = ({ employee }) => {
  return (
    <div className="py-4">
      <Alert 
        type="info" 
        message="Kullanıcı yetkilendirme özellikleri yakında eklenecektir. Bu modül şu anda geliştirme aşamasındadır."
      />
      
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Uygulama Yetkileri</h3>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <p className="text-gray-500 mb-4">
              Bu bölümde personelin uygulama içerisindeki yetkilerini yönetebileceksiniz.
              Örneğin, randevu oluşturma, düzenleme, silme gibi işlemleri yapıp yapamayacağını belirleyebileceksiniz.
            </p>
            
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Sistem Kullanıcısı</h4>
                  <p className="text-xs text-gray-500">Personelin sisteme giriş yapıp yapamayacağını belirler</p>
                </div>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {employee.userId ? 'Evet' : 'Hayır'}
                </span>
              </div>
              
              {/* Placeholder permission checkboxes */}
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="perm_read_appointments"
                      name="perm_read_appointments"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      disabled
                      checked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="perm_read_appointments" className="font-medium text-gray-700">
                      Randevuları Görüntüleme
                    </label>
                    <p className="text-gray-500">Randevuları görüntüleyebilir</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="perm_manage_appointments"
                      name="perm_manage_appointments"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      disabled
                      checked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="perm_manage_appointments" className="font-medium text-gray-700">
                      Randevu Yönetimi
                    </label>
                    <p className="text-gray-500">Randevu oluşturabilir, düzenleyebilir ve iptal edebilir</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="perm_view_customers"
                      name="perm_view_customers"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      disabled
                      checked
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="perm_view_customers" className="font-medium text-gray-700">
                      Müşterileri Görüntüleme
                    </label>
                    <p className="text-gray-500">Müşteri bilgilerini görüntüleyebilir</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="perm_manage_customers"
                      name="perm_manage_customers"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      disabled
                      checked={false}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="perm_manage_customers" className="font-medium text-gray-700">
                      Müşteri Yönetimi
                    </label>
                    <p className="text-gray-500">Müşteri ekleyebilir, düzenleyebilir ve silebilir</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="perm_admin"
                      name="perm_admin"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      disabled
                      checked={false}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="perm_admin" className="font-medium text-gray-700">
                      Yönetici Erişimi
                    </label>
                    <p className="text-gray-500">Tüm sistem ayarlarına, personel yönetimine ve raporlara erişebilir</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePermissions; 