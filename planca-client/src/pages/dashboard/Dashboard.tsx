// src/pages/dashboard/Dashboard.tsx - Alternative Implementation
import { FC, useCallback, useMemo, ReactNode, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import AppLayout from '@/shared/ui/layouts/AppLayout';
import Card from '@/shared/ui/components/Card';
import Button from '@/shared/ui/components/Button';
import { AppointmentDto } from '@/shared/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// Import from existing features - Using existing APIs directly
import { useGetCustomersQuery } from '@/features/customers/api';
import { useGetAppointmentsQuery } from '@/features/appointments/api/appointmentsAPI';

// Import dashboard utilities
import { 
  DashboardStatsCardProps,
  TodayAppointmentItemProps,
  BusinessInfoItemProps,
  formatDashboardValue,
  getTrendInfo
} from '@/features/dashboard';

// Skeleton loader component for stats cards
const StatCardSkeleton = memo(() => {
  return (
    <Card 
      className="animate-pulse overflow-hidden transition-all duration-300" 
      shadow="md"
      rounded="lg"
      variant="glass"
    >
      <div className="flex items-center p-5">
        <div className="flex-shrink-0 rounded-full p-3 bg-gray-200 h-12 w-12"></div>
        <div className="ml-5 w-0 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </Card>
  );
});

// Skeleton loader component for appointments
const AppointmentSkeleton = memo(() => (
  <div className="px-4 sm:px-6 py-4 flex items-center space-x-3 sm:space-x-4 transition-colors duration-200 border-b border-gray-200/50">
    <div className="flex-shrink-0">
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200"></div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="inline-flex items-center">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
));

// Memoized StatCard component
const StatCard = memo<DashboardStatsCardProps>(({ 
  title, 
  value, 
  icon, 
  change, 
  color = 'primary', 
  loading = false 
}) => {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-100/80 text-primary-800',
    secondary: 'bg-emerald-100/80 text-emerald-800',
    success: 'bg-green-100/80 text-green-800',
    warning: 'bg-yellow-100/80 text-yellow-800'
  };

  if (loading) {
    return <StatCardSkeleton />;
  }

  const trendInfo = change !== undefined ? getTrendInfo(change) : null;

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform-gpu" 
      shadow="md"
      rounded="lg"
      variant="glass"
      hover="glow"
    >
      <div className="flex items-center p-5">
        <div className={`flex-shrink-0 rounded-full p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="truncate text-sm font-medium text-gray-500">{title}</dt>
            <dd>
              <div className="text-xl font-semibold text-gray-900">
                {typeof value === 'number' && title.includes('Gelir') 
                  ? formatDashboardValue(value, 'currency')
                  : value
                }
              </div>
            </dd>
          </dl>
        </div>
      </div>
      {trendInfo && (
        <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-200/50 text-sm">
          <span className={`${trendInfo.color} font-medium`}>
            {trendInfo.label}
          </span>
          <span className="text-gray-500 ml-1">geçen aya göre</span>
        </div>
      )}
    </Card>
  );
});

// Business Info Item Component
const BusinessInfoItem = memo<BusinessInfoItemProps>(({ icon, label, value }) => (
  <div className="flex items-start space-x-3 p-3 bg-gray-50/50 rounded-lg transition-all hover:bg-gray-100/50">
    <div className="flex-shrink-0 text-gray-500 mt-0.5">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</h4>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  </div>
));

// Appointment item component
const AppointmentItem = memo<TodayAppointmentItemProps>(({ appointment, index, isLast }) => {
  const getInitials = useCallback((fullName: string) => {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);
  
  const formatAppointmentTime = useCallback((timeString: string) => {
    if (!timeString) return '';
    return format(new Date(timeString), 'HH:mm');
  }, []);

  const getTimeStatus = useCallback((timeString: string) => {
    if (!timeString) return { label: 'Bilinmiyor', color: 'bg-gray-100 text-gray-800' };
    
    const now = new Date();
    const appointmentTime = new Date(timeString);
    const diffInMinutes = Math.round((appointmentTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 0) {
      return { label: 'Geçmiş', color: 'bg-gray-100 text-gray-800' };
    } else if (diffInMinutes < 30) {
      return { label: 'Yaklaşıyor', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: formatAppointmentTime(timeString), color: 'bg-blue-100 text-blue-800' };
    }
  }, [formatAppointmentTime]);

  const timeStatus = getTimeStatus(appointment.startTime);

  return (
    <div 
      className={`px-4 sm:px-6 py-4 flex items-center space-x-3 sm:space-x-4 transition-all duration-200 
        hover:bg-gray-50/80 animate-fadeIn rounded-lg my-1
        ${!isLast ? 'border-b border-gray-200/50' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex-shrink-0">
        <div className={`flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full 
          ${index % 3 === 0 ? 'bg-primary-100 text-primary-800' :
            index % 3 === 1 ? 'bg-emerald-100 text-emerald-800' :
            'bg-blue-100 text-blue-800'}`}>
          {getInitials(appointment.customerName)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {appointment.customerName}
        </p>
        <div className="text-sm text-gray-500">
          <p className="truncate flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {appointment.serviceName}
          </p>
          <p className="truncate flex items-center mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {appointment.employeeName}
          </p>
        </div>
      </div>
      <div className="inline-flex flex-col items-end text-sm">
        <span className={`rounded-full px-2 sm:px-3 py-1 font-medium ${timeStatus.color}`}>
          {timeStatus.label}
        </span>
        <span className="text-xs text-gray-500 mt-1">
          {formatAppointmentTime(appointment.startTime)}
        </span>
      </div>
    </div>
  );
});

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const { user, tenant } = useAppSelector((state) => state.auth);
  
  // Date calculations
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
  
  // Use existing APIs directly instead of dashboard API
  
  // Total appointments
  const {
    data: totalAppointmentsData,
    isLoading: isLoadingTotalAppointments,
    error: totalAppointmentsError,
    refetch: refetchTotalAppointments
  } = useGetAppointmentsQuery(
    {
      pageNumber: 1,
      pageSize: 1,
    },
    { 
      skip: !tenant?.id,
      refetchOnMountOrArgChange: 300,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  // Today's appointments
  const {
    data: todayAppointmentsData,
    isLoading: isLoadingTodayAppointments,
    error: todayAppointmentsError,
    refetch: refetchTodayAppointments
  } = useGetAppointmentsQuery(
    {
      pageNumber: 1,
      pageSize: 10,
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
      sortBy: 'StartTime',
      sortDirection: 'asc',
    },
    { 
      skip: !tenant?.id,
      refetchOnMountOrArgChange: 120,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  // Upcoming appointments (from today onwards)
  const {
    data: upcomingAppointmentsData,
    isLoading: isLoadingUpcomingAppointments,
  } = useGetAppointmentsQuery(
    {
      pageNumber: 1,
      pageSize: 1,
      startDate: startOfDay.toISOString(),
    },
    { 
      skip: !tenant?.id,
      refetchOnMountOrArgChange: 300,
    }
  );

  // Customers count
  const {
    data: customersData,
    isLoading: isLoadingCustomers,
  } = useGetCustomersQuery(
    {
      pageNumber: 1,
      pageSize: 1,
    },
    { 
      skip: !tenant?.id,
      refetchOnMountOrArgChange: 300,
    }
  );

  // Completed appointments this month (for revenue calculation)
  const {
    data: completedAppointmentsData,
    isLoading: isLoadingCompletedAppointments,
  } = useGetAppointmentsQuery(
    {
      pageNumber: 1,
      pageSize: 100,
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
      status: 'Completed',
    },
    { 
      skip: !tenant?.id,
      refetchOnMountOrArgChange: 300,
    }
  );
  
  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    const totalAppointments = (totalAppointmentsData as any)?.totalCount || 0;
    const upcomingAppointments = (upcomingAppointmentsData as any)?.totalCount || 0;
    const customersCount = (customersData as any)?.totalCount || 0;
    
    // Calculate revenue from completed appointments
    const completedAppointments = (completedAppointmentsData as any)?.items || [];
    const revenueThisMonth = completedAppointments.reduce((total: number, appointment: any) => {
      const price = appointment.price || appointment.servicePrice || 150; // Default price
      return total + price;
    }, 0);

    return {
      totalAppointments,
      upcomingAppointments,
      customersCount,
      revenueThisMonth,
    };
  }, [totalAppointmentsData, upcomingAppointmentsData, customersData, completedAppointmentsData]);

  // Get today's appointments list
  const todayAppointments = useMemo(() => {
    return (todayAppointmentsData as any)?.items || [];
  }, [todayAppointmentsData]);

  // Loading state
  const isLoading = isLoadingTotalAppointments || isLoadingTodayAppointments || 
                   isLoadingUpcomingAppointments || isLoadingCustomers || 
                   isLoadingCompletedAppointments;
  
  // Error state
  const hasError = totalAppointmentsError || todayAppointmentsError;
  
  // Function to navigate to appointment creation form
  const handleCreateAppointment = useCallback(() => {
    navigate('/appointments', { state: { showForm: true } });
  }, [navigate]);

  // Function to navigate to appointments list
  const handleViewAllAppointments = useCallback(() => {
    navigate('/appointments');
  }, [navigate]);

  // Handle retry for failed requests
  const handleRetry = useCallback(() => {
    refetchTotalAppointments();
    refetchTodayAppointments();
  }, [refetchTotalAppointments, refetchTodayAppointments]);

  const currentDate = useMemo(() => {
    const date = new Date();
    return format(date, 'EEEE, d MMMM yyyy', { locale: tr });
  }, []);

  // Mock trend data (in real app, this would come from comparing periods)
  const mockTrends = {
    appointments: 12,
    customers: 5,
    revenue: -3
  };

  return (
    <AppLayout>
      <div className="w-full transition-all duration-300 px-2 sm:px-4 md:px-6 bg-white text-gray-800">
        <div className="border-b border-gray-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Hoş Geldiniz, {user?.name || user?.firstName || 'Kullanıcı'}</h2>
            <p className="mt-1 text-sm text-gray-500">{currentDate}</p>
          </div>
          <div className="mt-3 sm:mt-0 flex space-x-3">
            <Button
              variant="ghost"
              size="sm"
              rounded="lg"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              }
              onClick={handleCreateAppointment}
            >
              Yeni Randevu
            </Button>
          </div>
        </div>

        {/* Error Handling */}
        {hasError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-red-800">
                  Dashboard verileri yüklenirken hata oluştu
                </span>
              </div>
              <button
                onClick={handleRetry}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}

        <div className="animate-fadeIn">
          <h3 className="text-lg leading-6 font-medium text-gray-800 mb-5">
            Genel Bakış
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Toplam Randevu" 
              value={dashboardStats.totalAppointments} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              change={mockTrends.appointments}
              loading={isLoading}
            />
            <StatCard 
              title="Yaklaşan Randevular" 
              value={dashboardStats.upcomingAppointments} 
              color="warning"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              loading={isLoading}
            />
            <StatCard 
              title="Toplam Müşteri" 
              value={dashboardStats.customersCount} 
              color="secondary"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              change={mockTrends.customers}
              loading={isLoading}
            />
            <StatCard 
              title="Aylık Gelir" 
              value={dashboardStats.revenueThisMonth} 
              color="success"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              change={mockTrends.revenue}
              loading={isLoading}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card 
            title="İşletme Bilgileri" 
            padding="lg"
            shadow="md"
            rounded="lg"
            variant="gradient"
            hover="subtle"
            className="transition-all duration-300 bg-white text-gray-800"
          >
            {tenant ? (
              <div className="space-y-3">
                <BusinessInfoItem 
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>}
                  label="İşletme Adı"
                  value={tenant.name}
                />
                
                <BusinessInfoItem 
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>}
                  label="Alt Alan Adı"
                  value={<>
                    <span className="font-medium">{tenant.subdomain}</span>
                    <span className="text-gray-500">.planca.app</span>
                  </>}
                />
                
                {tenant.address && (
                  <BusinessInfoItem 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>}
                    label="Adres"
                    value={`${tenant.address}, ${tenant.city}, ${tenant.state} ${tenant.zipCode}`}
                  />
                )}
                
                {tenant.contactPhone && (
                  <BusinessInfoItem 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>}
                    label="İletişim"
                    value={tenant.contactPhone}
                  />
                )}
                
                <div className="pt-3 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    rounded="lg"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    }
                  >
                    İşletme Ayarlarını Düzenle
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-gray-500 mb-6">İşletme bilgisi bulunamadı.</p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  rounded="lg"
                  className="shadow-md hover:shadow-lg"
                >
                  İşletme Oluştur
                </Button>
              </div>
            )}
          </Card>

          <Card 
            title="Bugünkü Randevular" 
            padding="lg"
            shadow="md"
            rounded="lg"
            variant="glass"
            hover="subtle"
            className="transition-all duration-300 bg-white text-gray-800"
            actions={
              <Button 
                variant="outline" 
                size="sm" 
                rounded="lg"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                }
                onClick={handleViewAllAppointments}
              >
                Tümünü Görüntüle
              </Button>
            }
          >
            <div className="overflow-hidden -mx-2 sm:-mx-3 px-2">
              {isLoadingTodayAppointments ? (
                <>
                  <AppointmentSkeleton />
                  <AppointmentSkeleton />
                  <AppointmentSkeleton />
                </>
              ) : todayAppointments.length > 0 ? (
                <div className="space-y-2">
                  {todayAppointments.map((appointment, index) => (
                    <AppointmentItem 
                      key={appointment.id} 
                      appointment={appointment} 
                      index={index} 
                      isLast={index === todayAppointments.length - 1} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 animate-fadeIn">
                  <div className="bg-gray-50 rounded-2xl p-6 max-w-sm mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Bugün için randevu yok</h3>
                    <p className="text-gray-500 mb-6">Yeni bir randevu planlamak için aşağıdaki butona tıklayabilirsiniz.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      rounded="lg"
                      className="mt-2"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      }
                      onClick={handleCreateAppointment}
                    >
                      Randevu Planla
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;