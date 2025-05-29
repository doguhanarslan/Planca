import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { updateEmployee } from './employeesSlice';
import { EmployeeDto, ServiceDto } from '@/shared/types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Alert from '@/shared/ui/components/Alert';
import { fetchServices } from '@/features/services/servicesSlice';

interface EmployeeBasicInfoProps {
  employee: EmployeeDto;
}

const EmployeeBasicInfo: React.FC<EmployeeBasicInfoProps> = ({ employee }) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const { loading, error } = useAppSelector(state => state.employees);
  const { services } = useAppSelector(state => state.services);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Fetch services for the service selection
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);
  
  // Setup form validation
  const validationSchema = Yup.object({
    firstName: Yup.string().required('Ad gereklidir'),
    lastName: Yup.string().required('Soyad gereklidir'),
    email: Yup.string().email('Geçerli bir e-posta adresi girin').required('E-posta gereklidir'),
    phoneNumber: Yup.string(),
    title: Yup.string(),
    isActive: Yup.boolean(),
    serviceIds: Yup.array().of(Yup.string())
  });
  
  // Setup formik
  const formik = useFormik({
    initialValues: {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber || '',
      title: employee.title || '',
      isActive: employee.isActive,
      serviceIds: employee.serviceIds
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Send update request
        await dispatch(updateEmployee({
          id: employee.id,
          employeeData: {
            ...employee,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            title: values.title,
            isActive: values.isActive,
            serviceIds: values.serviceIds,
            userId: employee.userId, // Keep existing userId
          }
        }));
        
        setSuccessMessage('Personel bilgileri başarıyla güncellendi.');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (err) {
        console.error('Error updating employee:', err);
      }
    },
  });
  
  const handleServiceChange = (serviceId: string) => {
    const currentServiceIds = [...formik.values.serviceIds];
    const serviceIndex = currentServiceIds.indexOf(serviceId);
    
    if (serviceIndex >= 0) {
      // Remove service
      currentServiceIds.splice(serviceIndex, 1);
    } else {
      // Add service
      currentServiceIds.push(serviceId);
    }
    
    formik.setFieldValue('serviceIds', currentServiceIds);
  };
  
  return (
    <div>
      {/* Success message */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
        />
      )}
      
      {/* Error message */}
      {error && (
        <Alert
          type="error"
          message={error}
        />
      )}
      
      <div className="mb-4 flex justify-end">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Düzenle
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => {
                formik.resetForm();
                setIsEditing(false);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="button"
              onClick={() => formik.handleSubmit()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={loading || !formik.isValid}
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Personal information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kişisel Bilgiler</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Ad
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      formik.touched.firstName && formik.errors.firstName
                        ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                    } rounded-md shadow-sm text-sm`}
                    disabled={!isEditing || loading}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.firstName}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{employee.firstName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Soyad
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      formik.touched.lastName && formik.errors.lastName
                        ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                    } rounded-md shadow-sm text-sm`}
                    disabled={!isEditing || loading}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.lastName}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{employee.lastName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta
              </label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      formik.touched.email && formik.errors.email
                        ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                    } rounded-md shadow-sm text-sm`}
                    disabled={!isEditing || loading}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{employee.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Telefon Numarası
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm"
                    disabled={!isEditing || loading}
                  />
                </>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{employee.phoneNumber || '-'}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Ünvan
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm"
                    disabled={!isEditing || loading}
                  />
                </>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{employee.title || '-'}</p>
              )}
            </div>
            
            <div>
              <span className="block text-sm font-medium text-gray-700">Durum</span>
              {isEditing ? (
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formik.values.isActive}
                      onChange={formik.handleChange}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      disabled={!isEditing || loading}
                    />
                    <span className="ml-2 text-sm text-gray-700">Aktif</span>
                  </label>
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-900">
                  {employee.isActive ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Aktif
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Pasif
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Right column - Services */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Verdiği Hizmetler</h3>
          
          {isEditing ? (
            <div className="space-y-2">
              {services.length === 0 ? (
                <p className="text-sm text-gray-500">Henüz hiç hizmet tanımlanmamış.</p>
              ) : (
                services.map((service: ServiceDto) => (
                  <div key={service.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      name={`service-${service.id}`}
                      checked={formik.values.serviceIds.includes(service.id)}
                      onChange={() => handleServiceChange(service.id)}
                      className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      disabled={!isEditing || loading}
                    />
                    <label
                      htmlFor={`service-${service.id}`}
                      className="ml-2 block text-sm text-gray-900"
                    >
                      {service.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div>
              {employee.serviceIds.length === 0 ? (
                <p className="text-sm text-gray-500">Bu personel henüz hiçbir hizmet vermiyor.</p>
              ) : (
                <div className="space-y-1">
                  {services
                    .filter(service => employee.serviceIds.includes(service.id))
                    .map((service: ServiceDto) => (
                      <p 
                        key={service.id}
                        className="text-sm text-gray-900 py-1 px-2 bg-gray-100 rounded inline-block mr-2 mb-2"
                      >
                        {service.name}
                      </p>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeBasicInfo; 