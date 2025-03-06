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
    .required('Ad alanı zorunludur')
    .max(100, 'Ad en fazla 100 karakter olmalıdır'),
  lastName: Yup.string()
    .required('Soyad alanı zorunludur')
    .max(100, 'Soyad en fazla 100 karakter olmalıdır'),
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi gereklidir')
    .max(255, 'E-posta en fazla 255 karakter olmalıdır'),
  phoneNumber: Yup.string()
    .max(20, 'Telefon numarası en fazla 20 karakter olmalıdır'),
  password: Yup.string()
    .required('Şifre gereklidir')
    .min(8, 'Şifre en az 8 karakter olmalıdır')
    .matches(/[A-Z]/, 'Şifrenizde en az bir büyük harf olmalıdır')
    .matches(/[a-z]/, 'Şifrenizde en az bir küçük harf olmalıdır')
    .matches(/[0-9]/, 'Şifrenizde en az bir rakam olmalıdır'),
  confirmPassword: Yup.string()
    .required('Şifre tekrarı gereklidir')
    .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
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

  // Sadece üst kısım kırmızı olacak şekilde container stili
  const containerStyle = "min-h-screen flex items-center justify-center";

  return (
    <div className={containerStyle} style={{ 
      background: 'linear-gradient(to bottom, rgba(178, 34, 34, 0.9) 0%, rgba(178, 34, 34, 0.7) 25%, white 50%)',
      backdropFilter: 'blur(8px)'
    }}>
      <div className="max-w-lg w-full">
        <div className="text-center mb-8 bg-[#fbd5d5]/80 backdrop-blur-sm py-8 rounded-t-xl shadow-lg">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-white shadow-md flex items-center justify-center mb-4 border-2 border-[#fbd5d5]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#cc3333]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Planca</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Hesap Oluşturun</h2>
          <p className="text-sm text-gray-600">
            veya{' '}
            <Link to="/login" className="font-medium text-[#cc3333] hover:text-[#b22222] transition-colors">
              mevcut hesabınızla giriş yapın
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

        <div className="bg-white/95 backdrop-blur-md rounded-b-xl shadow-xl p-8 border border-gray-100">
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
                    label="Adınız"
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
                    label="Soyadınız"
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
                  label="E-posta Adresi"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.email}
                  touched={touched.email}
                  placeholder="E-posta adresiniz"
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
                  label="Telefon Numarası"
                  value={values.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phoneNumber}
                  touched={touched.phoneNumber}
                  placeholder="Telefon numaranız"
                  leftIcon={
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
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
                  placeholder="Şifre"
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
                  label="Şifre Tekrarı"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  placeholder="Şifre tekrarı"
                  required
                  leftIcon={
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  }
                />

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-transparent shadow-sm text-lg font-medium rounded-md bg-[#cc3333] hover:bg-[#b22222] text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e05252]"
                    disabled={loading || isSubmitting}
                  >
                    {loading || isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>İşlem yapılıyor...</span>
                      </span>
                    ) : (
                      "Hesap Oluştur"
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  Kaydolarak, Kullanım Koşullarını ve Gizlilik Politikasını kabul etmiş olursunuz.
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