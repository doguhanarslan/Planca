import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { loginUser, clearError, fetchCurrentUser } from './authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { LoginCredentials } from '@/types';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';



const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isBusinessRegistered, loading, error } = useAppSelector((state) => state.auth);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // If already authenticated, redirect to appropriate page
  useEffect(() => {
    // Set a short delay to detect if this is the initial app load or a user-initiated navigation
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // If authenticated and not initial page load, redirect
    if (isAuthenticated && !loading && !isInitialLoad) {
      if (isBusinessRegistered) {
        navigate('/dashboard'); // Dashboard for businesses
      } else {
        navigate('/create-business'); // Business registration for new users
      }
    }
  }, [isAuthenticated, isBusinessRegistered, navigate, loading, isInitialLoad]);

  const handleLogin = async (
    values: { email: string; password: string; rememberMe: boolean }, 
    { setSubmitting }: FormikHelpers<{ email: string; password: string; rememberMe: boolean }>
  ) => {
    // Convert form values to LoginCredentials type
    const credentials: LoginCredentials = {
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe
    };
    await dispatch(loginUser(credentials));
    await dispatch(fetchCurrentUser());
    // Set isInitialLoad to false to allow navigation after login
    setIsInitialLoad(false);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-4 border-[1px] border-red-600 transform transition-all duration-300 hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planca</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Hesabınıza Giriş Yapın</h2>
          <p className="text-base text-gray-600">
            veya{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              yeni bir hesap oluşturun
            </Link>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert 
            type="error" 
            message={Array.isArray(error) ? error.join(', ') : error}
            onClose={() => dispatch(clearError())}
          />
        )}

        {/* Login Form Card */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-lg">
          <Formik
            initialValues={{ email: '', password: '', rememberMe: false }}
            
            onSubmit={handleLogin}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }) => (
              <Form className="space-y-6">
                <Input
                  name="email"
                  type="email"
                  label="E-posta Adresi"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  touched={touched.email}
                  placeholder="ornek@mail.com"
                  required
                  leftIcon={
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  }
                />

                <Input
                  name="password"
                  type="password"
                  label="Şifre"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.password}
                  touched={touched.password}
                  placeholder="••••••••"
                  required
                  leftIcon={
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  }
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={values.rememberMe}
                      onChange={() => setFieldValue('rememberMe', !values.rememberMe)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600">
                      Beni hatırla
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                      Şifrenizi mi unuttunuz?
                    </a>
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    size="lg"
                    rounded="lg"
                    fullWidth
                    className="flex bg-red-800 hover:bg-red-900 items-center justify-center px-4 py-2 border border-gray-200 shadow-sm hover:border-primary-300 transition-all hover:cursor-pointer duration-300 ease-in-out transform hover:-translate-y-0.5"
                    isLoading={loading || isSubmitting}
                    loadingText="Giriş yapılıyor..."
                  >
                    Giriş Yap
                  </Button>
                </div>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">veya şununla devam edin</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm hover:border-primary-300 transition-all hover:cursor-pointer duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.545 10.239v3.821h5.445c-0.643 2.783-2.835 4.76-5.445 4.76-3.312 0-6-2.688-6-6s2.688-6 6-6c1.47 0 2.817 0.534 3.857 1.417l2.689-2.689c-1.798-1.588-4.144-2.56-6.545-2.56-5.518 0-10 4.482-10 10s4.482 10 10 10c6.035 0 10-4.027 10-9.715 0-0.647-0.057-1.296-0.175-1.921z"/>
                    </svg>
                    Google
                  </button>
                  <button 
                    type="button" 
                    className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm hover:border-primary-300 transition-all hover:cursor-pointer duration-300 ease-in-out transform hover:-translate-y-0.5"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.891h2.54v-2.203c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.891h-2.33v6.987c4.781-.75 8.438-4.887 8.438-9.878z"/>
                    </svg>
                    Facebook
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
        
        <p className="mt-6 text-center text-sm text-gray-500 flex justify-center space-x-4">
          <a href="#" className="font-medium text-gray-600 hover:text-gray-500 transition-colors">
            Gizlilik Politikası
          </a>
          <span className="text-gray-300">•</span>
          <a href="#" className="font-medium text-gray-600 hover:text-gray-500 transition-colors">
            Kullanım Koşulları
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;