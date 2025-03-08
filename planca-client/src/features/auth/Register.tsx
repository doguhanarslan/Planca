import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { registerUser, clearError } from "./authSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { RegisterUserData } from "@/types";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";

const registerValidationSchema = Yup.object({
  firstName: Yup.string()
    .required("First name is required")
    .max(100, "First name must not exceed 100 characters"),
  lastName: Yup.string()
    .required("Last name is required")
    .max(100, "Last name must not exceed 100 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required")
    .max(255, "Email must not exceed 255 characters"),
  phoneNumber: Yup.string().max(
    20,
    "Phone number must not exceed 20 characters"
  ),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isBusinessRegistered, loading, error } =
    useAppSelector((state) => state.auth);

  // If already authenticated, redirect to appropriate page
  useEffect(() => {
    if (isAuthenticated) {
      if (isBusinessRegistered) {
        navigate("/dashboard"); // Dashboard for businesses
      } else {
        navigate("/create-business"); // Business registration for new users
      }
    }
  }, [isAuthenticated, isBusinessRegistered, navigate]);

  const handleRegister = async (
    values: RegisterUserData,
    { setSubmitting, setTouched }: FormikHelpers<RegisterUserData>
  ) => {
    // Mark all fields as touched when form is submitted
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true,
    });

    await dispatch(registerUser(values));
    setSubmitting(false);
  };

  // Background with transparency effect
  const backgroundStyle = "min-h-screen flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm bg-opacity-90";

  return (
    <div className={backgroundStyle}>
      <div className="max-w-lg w-full">
        <div className="text-center mb-8 bg-red-100/80 py-8 rounded-t-lg">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-white shadow-md flex items-center justify-center mb-4 border-2 border-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Planca</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Create your account
          </h2>
          <p className="text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-red-400 hover:text-red-500 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <Alert
            type="error"
            message={Array.isArray(error) ? error.join(", ") : error}
            onClose={() => dispatch(clearError())}
            className="mb-6"
          />
        )}

        <div className="bg-white rounded-b-lg shadow-lg p-8 border border-gray-100">
          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              email: "",
              phoneNumber: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={registerValidationSchema}
            onSubmit={async (values, { setSubmitting, setTouched }) => {
              // Mark all fields as touched when form is submitted
              setTouched({
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                password: true,
                confirmPassword: true,
              });

              await dispatch(registerUser(values));
              setSubmitting(false);
            }}
            validateOnBlur={false}
            validateOnChange={false}
          >
            {({
              values,
              handleChange,
              handleBlur,
              errors,
              touched,
              isSubmitting,
            }) => (
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
                    variant="customRed"
                    className="w-full py-2.5"
                    size="lg"
                    isLoading={loading || isSubmitting}
                  >
                    Create Account
                  </Button>
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                  By registering, you agree to our Terms of Service and Privacy
                  Policy.
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
