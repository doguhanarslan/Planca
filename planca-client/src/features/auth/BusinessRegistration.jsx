import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { createBusinessForUser, clearError } from './authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const businessValidationSchema = Yup.object({
  name: Yup.string()
    .required('Business name is required')
    .max(100, 'Business name must not exceed 100 characters'),
  subdomain: Yup.string()
    .required('Subdomain is required')
    .max(50, 'Subdomain must not exceed 50 characters')
    .matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens'),
  address: Yup.string()
    .required('Address is required')
    .max(500, 'Address must not exceed 500 characters'),
  city: Yup.string()
    .required('City is required')
    .max(100, 'City must not exceed 100 characters'),
  state: Yup.string()
    .required('State is required')
    .max(100, 'State must not exceed 100 characters'),
  zipCode: Yup.string()
    .required('Zip code is required')
    .max(20, 'Zip code must not exceed 20 characters'),
  workSchedule: Yup.array().of(
    Yup.object().shape({
      day: Yup.number().required('Day is required'),
      openTime: Yup.string().required('Open time is required'),
      closeTime: Yup.string()
        .required('Close time is required')
        .test('is-after-open', 'Close time must be after open time', function (value) {
          return !this.parent.openTime || !value || value > this.parent.openTime;
        }),
    })
  )
});

const BusinessRegistration = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isBusinessRegistered, loading, error } = useSelector((state) => state.auth);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (isBusinessRegistered) {
      navigate('/dashboard'); // If business already registered, go to dashboard
    }
  }, [isAuthenticated, isBusinessRegistered, navigate]);

  const handleCreateBusiness = async (values) => {
    // Format the work schedule into the expected API format
    const workSchedule = values.workSchedule.map(schedule => ({
      day: parseInt(schedule.day),
      openTime: schedule.openTime,
      closeTime: schedule.closeTime
    }));

    const businessData = {
      ...values,
      workSchedule
    };

    await dispatch(createBusinessForUser(businessData));
  };

  // Default working hours for new business (9 AM - 5 PM, Monday to Friday)
  const initialWorkSchedule = daysOfWeek
    .filter(day => day.value >= 1 && day.value <= 5) // Monday to Friday
    .map(day => ({
      day: day.value,
      openTime: '09:00',
      closeTime: '17:00'
    }));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planca</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Business</h2>
          <p className="mt-2 text-sm text-gray-600">
            Set up your business profile to get started with Planca
          </p>
        </div>

        {error && (
          <Alert 
            type="error" 
            message={Array.isArray(error) ? error.join(', ') : error}
            onClose={() => dispatch(clearError())}
          />
        )}

        <Formik
          initialValues={{
            name: '',
            subdomain: '',
            logoUrl: '',
            primaryColor: '#3498db',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            workSchedule: initialWorkSchedule
          }}
          validationSchema={businessValidationSchema}
          onSubmit={handleCreateBusiness}
        >
          {({ values, handleChange, handleBlur, errors, touched, setFieldValue }) => (
            <Form className="mt-8 space-y-6">
              <div className="bg-white p-8 shadow-lg rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">Business Information</h3>
                
                <div className="space-y-6">
                  <Input
                    name="name"
                    type="text"
                    label="Business Name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.name}
                    touched={touched.name}
                    placeholder="Your Business Name"
                    required
                  />

                  <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="flex-1">
                      <Input
                        name="subdomain"
                        type="text"
                        label="Subdomain"
                        value={values.subdomain}
                        onChange={(e) => {
                          // Convert to lowercase and replace invalid characters
                          const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                          setFieldValue('subdomain', value);
                        }}
                        onBlur={handleBlur}
                        error={errors.subdomain}
                        touched={touched.subdomain}
                        placeholder="your-business"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Your business URL will be: <span className="font-medium">https://{values.subdomain || 'your-business'}.planca.app</span>
                      </p>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          name="primaryColor"
                          value={values.primaryColor}
                          onChange={handleChange}
                          className="h-10 w-10 border-gray-300 rounded-md shadow-sm cursor-pointer"
                        />
                        <Input
                          name="primaryColor"
                          type="text"
                          value={values.primaryColor}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="#3498db"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 shadow-lg rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">Address Information</h3>
                
                <div className="space-y-6">
                  <Input
                    name="address"
                    type="text"
                    label="Street Address"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.address}
                    touched={touched.address}
                    placeholder="123 Main St"
                    required
                  />

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <Input
                      name="city"
                      type="text"
                      label="City"
                      value={values.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.city}
                      touched={touched.city}
                      placeholder="City"
                      required
                    />

                    <Input
                      name="state"
                      type="text"
                      label="State/Province"
                      value={values.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.state}
                      touched={touched.state}
                      placeholder="State"
                      required
                    />

                    <Input
                      name="zipCode"
                      type="text"
                      label="Zip/Postal Code"
                      value={values.zipCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.zipCode}
                      touched={touched.zipCode}
                      placeholder="Zip Code"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 shadow-lg rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b">Business Hours</h3>
                <p className="text-sm text-gray-500 mb-6">Set your regular business hours. You can update these later.</p>
                
                <FieldArray name="workSchedule">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.workSchedule.map((schedule, index) => (
                        <div key={index} className="flex flex-col p-4 border border-gray-200 rounded-lg sm:flex-row sm:space-x-4">
                          <div className="sm:w-1/3 mb-4 sm:mb-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Day
                            </label>
                            <select
                              name={`workSchedule.${index}.day`}
                              value={schedule.day}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                              {daysOfWeek.map((day) => (
                                <option key={day.value} value={day.value}>
                                  {day.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="sm:w-1/3 mb-4 sm:mb-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Open Time
                            </label>
                            <input
                              type="time"
                              name={`workSchedule.${index}.openTime`}
                              value={schedule.openTime}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            {errors.workSchedule && 
                             errors.workSchedule[index] && 
                             errors.workSchedule[index].openTime && 
                             touched.workSchedule && 
                             touched.workSchedule[index] && 
                             touched.workSchedule[index].openTime && (
                              <p className="mt-2 text-sm text-red-600">
                                {errors.workSchedule[index].openTime}
                              </p>
                            )}
                          </div>
                          
                          <div className="sm:w-1/3 mb-4 sm:mb-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Close Time
                            </label>
                            <input
                              type="time"
                              name={`workSchedule.${index}.closeTime`}
                              value={schedule.closeTime}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            {errors.workSchedule && 
                             errors.workSchedule[index] && 
                             errors.workSchedule[index].closeTime && 
                             touched.workSchedule && 
                             touched.workSchedule[index] && 
                             touched.workSchedule[index].closeTime && (
                              <p className="mt-2 text-sm text-red-600">
                                {errors.workSchedule[index].closeTime}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-end justify-center sm:justify-start">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-800 focus:outline-none"
                              aria-label="Remove this business hour"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => push({ day: 0, openTime: '09:00', closeTime: '17:00' })}
                        className="mt-4"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Business Hours
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 text-lg"
                  isLoading={loading}
                >
                  Create Business
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default BusinessRegistration;