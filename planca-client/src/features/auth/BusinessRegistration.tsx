import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, FieldArray, FormikHelpers } from "formik";
import * as Yup from "yup";
import { createBusinessForUser, clearError } from "./authSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { BusinessData, WorkSchedule } from "@/types";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Alert from "@/components/common/Alert";
import Card from "@/components/common/Card";

interface DayOption {
  value: number;
  label: string;
}

const daysOfWeek: DayOption[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const businessValidationSchema = Yup.object({
  name: Yup.string()
    .required("Business name is required")
    .max(100, "Business name must not exceed 100 characters"),
  subdomain: Yup.string()
    .required("Subdomain is required")
    .max(50, "Subdomain must not exceed 50 characters")
    .matches(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Subdomain can only contain lowercase letters, numbers, and hyphens"
    ),
  address: Yup.string()
    .required("Address is required")
    .max(500, "Address must not exceed 500 characters"),
  city: Yup.string()
    .required("City is required")
    .max(100, "City must not exceed 100 characters"),
  state: Yup.string()
    .required("State is required")
    .max(100, "State must not exceed 100 characters"),
  zipCode: Yup.string()
    .required("Zip code is required")
    .max(20, "Zip code must not exceed 20 characters"),
    workSchedule: Yup.array().of(
      Yup.object().shape({
        day: Yup.number().required('Day is required'),
        openTimeString: Yup.string().required('Open time is required'),
        closeTimeString: Yup.string()
          .required('Close time is required')
          .test('is-after-open', 'Close time must be after open time', function(value) {
            const { openTimeString } = this.parent;
            if (!openTimeString || !value) return true;
            return value > openTimeString;
          }),
      })
    )
});

interface FormValues extends Omit<BusinessData, "workSchedule"> {
  workSchedule: (WorkSchedule & { id?: string })[];
  logoUrl: string;
  primaryColor: string;
}

const BusinessRegistration: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isBusinessRegistered, loading, error } =
    useAppSelector((state) => state.auth);

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (isBusinessRegistered) {
      navigate("/dashboard"); // If business already registered, go to dashboard
    }
  }, [isAuthenticated, isBusinessRegistered, navigate]);

  const handleCreateBusiness = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const workSchedule = values.workSchedule.map(schedule => ({
        day: parseInt(schedule.day.toString()),
        openTimeString: schedule.openTimeString,
        closeTimeString: schedule.closeTimeString
      }));
  
      const businessData = {
        name: values.name,
        subdomain: values.subdomain,
        logoUrl: values.logoUrl || "",
        primaryColor: values.primaryColor,
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        workSchedule
      } as BusinessData; // Type assertion ekleyelim
  
      console.log('Sending business data:', businessData);
      
      const result = await dispatch(createBusinessForUser(businessData)).unwrap();
      console.log('Business creation result:', result);
      
      if (result) {
        // Başarılı olursa dashboard'a yönlendir
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error creating business:', error);
      // Hata mesajını göster
      dispatch(clearError());
    } finally {
      setSubmitting(false);
    }
  };

  // Default working hours for new business (9 AM - 5 PM, Monday to Friday)
  const initialWorkSchedule = daysOfWeek
    .filter((day) => day.value >= 1 && day.value <= 5) // Monday to Friday
    .map((day) => ({
      day: day.value,
      openTimeString: "09:00",
      closeTimeString: "17:00",
    }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Planca
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Create Your Business
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
            Set up your business profile to get started with Planca
          </p>
        </div>

        {error && (
          <Alert
            type="error"
            message={Array.isArray(error) ? error.join(", ") : error}
            onClose={() => dispatch(clearError())}
          />
        )}

        <Formik<FormValues>
          initialValues={{
            name: "",
            subdomain: "",
            logoUrl: "",
            primaryColor: "#3498db",
            address: "",
            city: "",
            state: "",
            zipCode: "",
            workSchedule: initialWorkSchedule,
          }}
          validationSchema={businessValidationSchema}
          onSubmit={handleCreateBusiness}
        >
          {({
            values,
            handleChange,
            handleBlur,
            errors,
            touched,
            setFieldValue,
          }) => (
            <Form className="mt-8 space-y-6">
              <Card
                shadow="lg"
                rounded="xl"
                hover={false}
                className="overflow-hidden transition-all duration-300 border-t-4 border-t-primary-500"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b dark:border-gray-700 transition-colors duration-300">
                  Business Information
                </h3>

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
                          const value = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "");
                          setFieldValue("subdomain", value);
                        }}
                        onBlur={handleBlur}
                        error={errors.subdomain}
                        touched={touched.subdomain}
                        placeholder="your-business"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Your business URL will be:{" "}
                        <span className="font-medium text-primary-600 dark:text-primary-400">
                          https://{values.subdomain || "your-business"}
                          .planca.app
                        </span>
                      </p>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 transition-colors duration-300">
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
              </Card>

              <Card
                shadow="lg"
                rounded="xl"
                hover={false}
                className="overflow-hidden transition-all duration-300 border-t-4 border-t-primary-500"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b dark:border-gray-700 transition-colors duration-300">
                  Address Information
                </h3>

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
              </Card>

              <Card
                shadow="lg"
                rounded="xl"
                hover={false}
                className="overflow-hidden transition-all duration-300 border-t-4 border-t-primary-500"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b dark:border-gray-700 transition-colors duration-300">
                  Business Hours
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">
                  Set your regular business hours. You can update these later.
                </p>

                <FieldArray name="workSchedule">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.workSchedule.map((schedule, index) => (
                        <div
                          key={index}
                          className="flex flex-col p-4 border border-gray-200 dark:border-gray-700 rounded-lg sm:flex-row sm:space-x-4 transition-all duration-200 hover:shadow-md bg-white dark:bg-secondary-800"
                        >
                          <div className="sm:w-1/3 mb-4 sm:mb-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 transition-colors duration-300">
                              Day
                            </label>
                            <select
                              name={`workSchedule.${index}.day`}
                              value={schedule.day}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-secondary-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200"
                            >
                              {daysOfWeek.map((day) => (
                                <option key={day.value} value={day.value}>
                                  {day.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:w-1/3 mb-4 sm:mb-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 transition-colors duration-300">
                              Open Time
                            </label>
                            <input
                              type="time"
                              name={`workSchedule.${index}.openTimeString`}
                              value={schedule.openTimeString || ""}
                              onChange={(e) => {
                                setFieldValue(
                                  `workSchedule.${index}.openTimeString`,
                                  e.target.value
                                );
                                setFieldValue(
                                  `workSchedule.${index}.openTime`,
                                  e.target.value
                                );
                              }}
                              onBlur={handleBlur}
                              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-secondary-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200"
                            />
                            {errors.workSchedule &&
                              Array.isArray(errors.workSchedule) &&
                              errors.workSchedule[index] &&
                              typeof errors.workSchedule[index] === "object" &&
                              "openTime" in errors.workSchedule[index] &&
                              touched.workSchedule &&
                              Array.isArray(touched.workSchedule) &&
                              touched.workSchedule[index] &&
                              typeof touched.workSchedule[index] === "object" &&
                              "openTime" in touched.workSchedule[index] && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                                  {errors.workSchedule[index] &&
                                    typeof errors.workSchedule[index] ===
                                      "object" &&
                                    "openTime" in errors.workSchedule[index] &&
                                    String(errors.workSchedule[index].openTime)}
                                </p>
                              )}
                          </div>

                          <div className="sm:w-1/3 mb-4 sm:mb-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 transition-colors duration-300">
                              Close Time
                            </label>
                            <input
                              type="time"
                              name={`workSchedule.${index}.closeTimeString`}
                              value={schedule.closeTimeString || ""}
                              onChange={(e) => {
                                setFieldValue(
                                  `workSchedule.${index}.closeTimeString`,
                                  e.target.value
                                );
                                setFieldValue(
                                  `workSchedule.${index}.closeTime`,
                                  e.target.value
                                );
                              }}
                              onBlur={handleBlur}
                              className="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-secondary-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200"
                            />
                            {errors.workSchedule &&
                              Array.isArray(errors.workSchedule) &&
                              errors.workSchedule[index] &&
                              typeof errors.workSchedule[index] === "object" &&
                              "closeTime" in errors.workSchedule[index] &&
                              touched.workSchedule &&
                              Array.isArray(touched.workSchedule) &&
                              touched.workSchedule[index] &&
                              typeof touched.workSchedule[index] === "object" &&
                              "closeTime" in touched.workSchedule[index] && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
                                  {errors.workSchedule[index] &&
                                    typeof errors.workSchedule[index] ===
                                      "object" &&
                                    "closeTime" in errors.workSchedule[index] &&
                                    String(
                                      errors.workSchedule[index].closeTime
                                    )}
                                </p>
                              )}
                          </div>

                          <div className="flex items-end justify-center sm:justify-start">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none transition-colors duration-200"
                              aria-label="Remove this business hour"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => push({ 
                          day: 0, 
                          openTimeString: '09:00',
                          closeTimeString: '17:00' 
                        })}
                        className="mt-4"
                        icon={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        }
                      >
                        Add Business Hours
                      </Button>
                    </div>
                  )}
                </FieldArray>
              </Card>

              <div className="pt-6">
                <Button
                  type="submit"
                  variant="primary"
                  size="xl"
                  rounded="lg"
                  className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300"
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
