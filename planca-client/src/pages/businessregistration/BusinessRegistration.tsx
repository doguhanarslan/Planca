import { useEffect } from "react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, FieldArray, FormikHelpers } from "formik";
import * as Yup from "yup";
import { createBusinessForUser, clearError } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { BusinessData, WorkSchedule } from "@/shared/types";
import Input from "@/shared/ui/components/Input";
import Button from "@/shared/ui/components/Button";
import Alert from "@/shared/ui/components/Alert";
import Card from "@/shared/ui/components/Card";

interface DayOption {
  value: number;
  label: string;
}

const daysOfWeek: DayOption[] = [
  { value: 0, label: "Pazar" },
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
];

const businessValidationSchema = Yup.object({
  name: Yup.string()
    .required("İşletme adı zorunludur")
    .max(100, "İşletme adı 100 karakteri geçmemelidir"),
  subdomain: Yup.string()
    .required("Alt alan adı zorunludur")
    .max(50, "Alt alan adı 50 karakteri geçmemelidir")
    .matches(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Alt alan adı sadece küçük harfler, sayılar ve tire içerebilir"
    ),
  address: Yup.string()
    .required("Adres zorunludur")
    .max(500, "Adres 500 karakteri geçmemelidir"),
  city: Yup.string()
    .required("Şehir zorunludur")
    .max(100, "Şehir 100 karakteri geçmemelidir"),
  state: Yup.string()
    .required("İlçe zorunludur")
    .max(100, "İlçe 100 karakteri geçmemelidir"),
  zipCode: Yup.string()
    .required("Posta kodu zorunludur")
    .max(20, "Posta kodu 20 karakteri geçmemelidir"),
  primaryColor: Yup.string()
    .matches(
      /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
      "Geçerli bir HEX renk kodu giriniz (örn: #FF5733 veya #F57)"
    ),
  workSchedule: Yup.array().of(
    Yup.object().shape({
      day: Yup.number().required('Gün zorunludur'),
      openTimeString: Yup.string().required('Açılış saati zorunludur'),
      closeTimeString: Yup.string()
        .required('Kapanış saati zorunludur')
        // closeTime must be after openTime
        .test({
          name: 'is-after-open',
          message: 'Kapanış saati açılış saatinden sonra olmalıdır',
          test: function(closeTime, context) {
            const { openTimeString } = this.parent;
            if (!openTimeString || !closeTime) return true;
            return closeTime > openTimeString;
          }
        })
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
      // Çalışma saatlerini düzgünce işle
      const workSchedule = values.workSchedule.map(schedule => {
        // Gün değerini sayıya çevir
        const day = parseInt(schedule.day.toString());
        
        // Saat değerlerini al
        const openTimeString = schedule.openTimeString || "09:00";
        const closeTimeString = schedule.closeTimeString || "17:00";
        
        // API'nin beklediği format
        return {
          day,
          openTimeString,
          closeTimeString
        };
      });
  
      // Ensure the primaryColor is in proper hex format (including the # if missing)
      let primaryColor = values.primaryColor;
      if (primaryColor && !primaryColor.startsWith('#')) {
        primaryColor = `#${primaryColor}`;
      }
      
      // Validate if it's a proper hex color
      const isValidHexColor = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(primaryColor);
      if (!isValidHexColor) {
        console.error('Geçersiz renk kodu:', primaryColor);
        // Fallback to a default color if invalid
        primaryColor = '#3498db';
      }
      
      const businessData = {
        name: values.name,
        subdomain: values.subdomain,
        logoUrl: values.logoUrl || "",
        primaryColor: primaryColor,
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        workSchedule
      } as BusinessData;
  
      console.log('İşletme verileri gönderiliyor:', businessData);
      
      const result = await dispatch(createBusinessForUser(businessData)).unwrap();
      console.log('İşletme oluşturma sonucu:', result);
      
      if (result) {
        // Başarılı olursa dashboard'a yönlendir
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('İşletme oluşturulurken hata:', error);
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
    <div className="min-h-screen bg-gray-50  py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900  mb-2 transition-colors duration-300">
            Planca
          </h1>
          <h2 className="text-2xl font-bold text-gray-900  mb-2 transition-colors duration-300">
            İşletmenizi Oluşturun
          </h2>
          <p className="mt-2 text-sm text-gray-600  transition-colors duration-300">
            Planca ile başlamak için işletme profilinizi oluşturun
          </p>
        </div>

        {error && (
          <Alert
            type="error"
            message={Array.isArray(error) ? error.join(", ") : error}
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
                <h3 className="text-lg font-semibold text-gray-900  mb-6 pb-2 border-b  transition-colors duration-300">
                  İşletme Bilgileri
                </h3>

                <div className="space-y-6">
                  <Input
                    name="name"
                    type="text"
                    label="İşletme Adı"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.name}
                    touched={touched.name}
                    placeholder="İşletmenizin Adı"
                    required
                  />

                  <div className="flex flex-col gap-10 sm:flex-row">
                    <div className="flex-1">
                      <Input
                        name="subdomain"
                        type="text"
                        label="Alt Alan Adı"
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
                        placeholder="isletmeniz"
                        required
                      />
                      <p className="text-sm text-gray-500 text-nowrap transition-colors duration-300">
                        İşletmenizin URL'si:{" "}
                        <span className="font-bold text-primary-600 ">
                          https://{values.subdomain || "isletmeniz"}
                          .planca.app
                        </span>
                      </p>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-300">
                        Marka Rengi
                      </label>
                      <div className="flex items-center justify-center space-x-2">
                        
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
                <h3 className="text-lg font-semibold text-gray-900  mb-6 pb-2 border-b transition-colors duration-300">
                  Adres Bilgileri
                </h3>

                <div className="space-y-6">
                  <Input
                    name="address"
                    type="text"
                    label="Cadde Adresi"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.address}
                    touched={touched.address}
                    placeholder="Atatürk Caddesi No: 123"
                    required
                  />

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <Input
                      name="city"
                      type="text"
                      label="Şehir"
                      value={values.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.city}
                      touched={touched.city}
                      placeholder="İstanbul"
                      required
                    />

                    <Input
                      name="state"
                      type="text"
                      label="İlçe"
                      value={values.state}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.state}
                      touched={touched.state}
                      placeholder="Kadıköy"
                      required
                    />

                    <Input
                      name="zipCode"
                      type="text"
                      label="Posta Kodu"
                      value={values.zipCode}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.zipCode}
                      touched={touched.zipCode}
                      placeholder="34000"
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
                <h3 className="text-lg font-semibold text-gray-900  mb-6 pb-2 border-b  transition-colors duration-300">
                  Çalışma Saatleri
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors duration-300">
                  Normal çalışma saatlerinizi ayarlayın. Bunları daha sonra güncelleyebilirsiniz.
                </p>

                <FieldArray name="workSchedule">
                  {({ remove, push }) => (
                    <div className="space-y-4">
                      {values.workSchedule.map((schedule, index) => (
                        <div
                          key={index}
                          className="flex flex-col p-4 border border-gray-200 rounded-lg sm:flex-row sm:space-x-4 transition-all duration-200 hover:shadow-md bg-white"
                        >
                          <div className="sm:w-1/4 mb-4 sm:mb-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-300">
                              Gün
                            </label>
                            <select
                              name={`workSchedule.${index}.day`}
                              value={schedule.day}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200 h-10"
                            >
                              {daysOfWeek.map((day) => (
                                <option key={day.value} value={day.value}>
                                  {day.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:w-1/3 mb-4 sm:mb-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-300">
                              Açılış Saati
                            </label>
                            <input
                              type="time"
                              name={`workSchedule.${index}.openTimeString`}
                              value={schedule.openTimeString || ""}
                              onChange={(e) => {
                                const timeValue = e.target.value;
                                setFieldValue(
                                  `workSchedule.${index}.openTimeString`,
                                  timeValue
                                );
                                // Eğer kapanış saati boşsa veya açılış saatinden önce ise otomatik güncelle
                                const closeTime = schedule.closeTimeString;
                                if (!closeTime || closeTime <= timeValue) {
                                  // Açılış saatine 1 saat ekleyelim
                                  let [hours, minutes] = timeValue.split(':').map(Number);
                                  hours = (hours + 1) % 24;
                                  const newCloseTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                                  setFieldValue(
                                    `workSchedule.${index}.closeTimeString`,
                                    newCloseTime
                                  );
                                }
                              }}
                              onBlur={handleBlur}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200 h-10 text-gray-800"
                            />
                          </div>

                          <div className="sm:w-1/3 mb-4 sm:mb-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors duration-300">
                              Kapanış Saati
                            </label>
                            <input
                              type="time"
                              name={`workSchedule.${index}.closeTimeString`}
                              value={schedule.closeTimeString || ""}
                              onChange={(e) => {
                                const timeValue = e.target.value;
                                // Kapanış saatinin açılış saatinden sonra olmasını kontrol et
                                const openTime = schedule.openTimeString;
                                if (!openTime || timeValue > openTime) {
                                  setFieldValue(
                                    `workSchedule.${index}.closeTimeString`,
                                    timeValue
                                  );
                                } else {
                                  // Eğer kapanış saati açılış saatinden önce ise, kapanış saatini açılış saatinin 1 saat sonrası olarak ayarla
                                  let [hours, minutes] = openTime.split(':').map(Number);
                                  hours = (hours + 1) % 24;
                                  const newCloseTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                                  setFieldValue(
                                    `workSchedule.${index}.closeTimeString`,
                                    newCloseTime
                                  );
                                }
                              }}
                              onBlur={handleBlur}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-colors duration-200 h-10 text-gray-800"
                            />
                          </div>
                          
                          <div className="flex items-end justify-center sm:justify-start ml-2">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 focus:outline-none transition-colors duration-200"
                              aria-label="Bu çalışma saatini kaldır"
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
                        Çalışma Saati Ekle
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
                  className="w-full bg-red-600 hover:bg-red-900 focus:bg-red-600 duration-300 shadow-lg hover:shadow-xl transition-all"
                  isLoading={loading}
                >
                  İşletme Oluştur
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