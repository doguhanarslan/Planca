import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { registerUser, clearError } from './authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const registerValidationSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required')
    .max(100, 'First name must not exceed 100 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .max(100, 'Last name must not exceed 100 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
    .max(255, 'Email must not exceed 255 characters'),
  phoneNumber: Yup.string()
    .max(20, 'Phone number must not exceed 20 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isBusinessRegistered, loading, error } = useSelector((state) => state.auth);

  // If already authenticated, redirect to appropriate page
  useEffect(() => {
    if (isAuthenticated) {
      if (isBusinessRegistered) {
        navigate('/dashboard'); // Dashboard for businesses
      } else {
        navigate('/create-business'); // Business registration for new users
      }
    }
  }, [isAuthenticated, isBusinessRegistered, navigate]);

  const handleRegister = async (values, { setSubmitting, setTouched }) => {
    // Mark all fields as touched when form is submitted
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true
    });
    
    const userData = {
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: values.phoneNumber
    };

    await dispatch(registerUser(userData));
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planca</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create your account</h2>
          <p className="text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <Alert 
            type="error" 
            message={Array.isArray(error) ? error.join(', ') : error}
            onClose={() => dispatch(clearError())}
            className="mb-6"
          />
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phoneNumber: '',
              password: '',
              confirmPassword: ''
            }}
            validationSchema={registerValidationSchema}
            onSubmit={handleRegister}
            validateOnBlur={false}
            validateOnChange={false}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Input
                    name="firstName"
                    type="text"
                    label="First name"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.firstName}
                    touched={touched.firstName}
                    placeholder="First name"
                    required
                  />

                  <Input
                    name="lastName"
                    type="text"
                    label="Last name"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.lastName}
                    touched={touched.lastName}
                    placeholder="Last name"
                    required
                  />
                </div>

                <Input
                  name="email"
                  type="email"
                  label="Email address"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  touched={touched.email}
                  placeholder="Email address"
                  required
                />

                <Input
                  name="phoneNumber"
                  type="tel"
                  label="Phone number"
                  value={values.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phoneNumber}
                  touched={touched.phoneNumber}
                  placeholder="Phone number"
                />

                <Input
                  name="password"
                  type="password"
                  label="Password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  touched={touched.password}
                  placeholder="Password"
                  required
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  label="Confirm password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  placeholder="Confirm password"
                  required
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-2.5"
                    size="lg"
                    isLoading={loading || isSubmitting}
                  >
                    Create Account
                  </Button>
                </div>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  By registering, you agree to our Terms of Service and Privacy Policy.
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Register;