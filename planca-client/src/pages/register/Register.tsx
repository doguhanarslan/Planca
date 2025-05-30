import { useEffect } from 'react';
import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { registerUser, clearError } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { RegisterUserData } from '@/shared/types';
import Input from '@/shared/ui/components/Input';
import Button from '@/shared/ui/components/Button';
import Alert from '@/shared/ui/components/Alert';

// Define a type for the form values where all fields are strings
interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string; // Ensure this is a string for the form
  password: string;
  confirmPassword: string;
}

const registerValidationSchema = Yup.object({
  firstName: Yup.string()
    .required('Ad zorunludur')
    .max(100, 'Ad en fazla 100 karakter olmalıdır'),
  lastName: Yup.string()
    .required('Soyad zorunludur')
    .max(100, 'Soyad en fazla 100 karakter olmalıdır'),
  email: Yup.string()
    .email('Geçersiz e-posta adresi')
    .required('E-posta zorunludur')
    .max(255, 'E-posta en fazla 255 karakter olmalıdır'),
  phoneNumber: Yup.string()
    .max(20, 'Telefon numarası en fazla 20 karakter olmalıdır'),
  password: Yup.string()
    .required('Şifre zorunludur')
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
    .matches(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
    .matches(/[0-9]/, 'Şifre en az bir rakam içermelidir'),
  confirmPassword: Yup.string()
    .required('Şifre onayı zorunludur')
    .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
});

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isBusinessRegistered, loading, error } = useAppSelector((state) => state.auth);

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

  const handleRegister = async (
    values: RegisterFormValues, // Use RegisterFormValues here
    { setSubmitting, setTouched }: FormikHelpers<RegisterFormValues> // And here
  ) => {
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true
    });
  
    try {
      // Construct RegisterUserData from form values
      const userData: RegisterUserData = {
        ...values,
        phoneNumber: values.phoneNumber || undefined, // Convert back to string | undefined
      };
      await dispatch(registerUser(userData)).unwrap();
      // Başarılı kayıt sonrası otomatik olarak create-business sayfasına yönlendirilecek
      // (useEffect hook'u isAuthenticated değiştiğinde bunu yapacak)
    } catch (error) {
      console.error('Kayıt işlemi başarısız:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-6 border-2 border-primary-100 transform transition-transform hover:scale-105 duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Planca</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Hesabınızı Oluşturun</h2>
          <p className="text-base text-gray-600">
            veya{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              mevcut hesabınıza giriş yapın
            </Link>
          </p>
        </div>

        {error && (
          <Alert 
            type="error" 
            message={Array.isArray(error) ? error.join(', ') : error}
            dismissible={true}
            onDismiss={() => dispatch(clearError())}
          />
        )}

        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200 transition-all duration-300">
          <Formik<RegisterFormValues> // Specify the type for Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phoneNumber: '', // Initialized as empty string
              password: '',
              confirmPassword: ''
            } as RegisterFormValues} // Assert type here for safety
            validationSchema={registerValidationSchema}
            onSubmit={handleRegister}
          >
            {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Input
                    name="firstName"
                    type="text"
                    label="Ad"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.firstName}
                    touched={touched.firstName}
                    placeholder="Adınız"
                    required
                  />

                  <Input
                    name="lastName"
                    type="text"
                    label="Soyad"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.lastName}
                    touched={touched.lastName}
                    placeholder="Soyadınız"
                    required
                  />
                </div>

                <Input
                  name="email"
                  type="email"
                  label="E-posta adresi"
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
                  name="phoneNumber"
                  type="tel"
                  label="Telefon numarası"
                  value={values.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phoneNumber}
                  touched={touched.phoneNumber}
                  placeholder="+90 xxx xxx xx xx"
                  leftIcon={
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  }
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

                  <Input
                    name="confirmPassword"
                    type="password"
                    label="Şifre onayı"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
                    placeholder="••••••••"
                    required
                    leftIcon={
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 font-medium bg-red-600 hover:bg-red-900 focus:bg-red-600"
                    size="lg"
                    isLoading={loading || isSubmitting}
                  >
                    Hesap Oluştur
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
                    className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-primary-300 hover:text-primary-600 transition-all duration-200"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.545 10.239v3.821h5.445c-0.643 2.783-2.835 4.76-5.445 4.76-3.312 0-6-2.688-6-6s2.688-6 6-6c1.47 0 2.817 0.534 3.857 1.417l2.689-2.689c-1.798-1.588-4.144-2.56-6.545-2.56-5.518 0-10 4.482-10 10s4.482 10 10 10c6.035 0 10-4.027 10-9.715 0-0.647-0.057-1.296-0.175-1.921z"/>
                    </svg>
                    Google
                  </button>
                  <button 
                    type="button" 
                    className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-primary-300 hover:text-primary-600 transition-all duration-200"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.891h2.54v-2.203c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.891h-2.33v6.987c4.781-.75 8.438-4.887 8.438-9.878z"/>
                    </svg>
                    Facebook
                  </button>
                </div>
                
                <div className="mt-6 flex items-center justify-center">
                  <div className="text-sm">
                    <p className="text-xs text-center text-gray-500">
                      Kayıt olarak, 
                      <a href="#" className="font-medium text-primary-600 hover:text-primary-500 mx-1">Kullanım Koşullarını</a> 
                      ve 
                      <a href="#" className="font-medium text-primary-600 hover:text-primary-500 mx-1">Gizlilik Politikasını</a> 
                      kabul etmiş olursunuz.
                    </p>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Register;