import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import AppLayout from '@/components/layouts/AppLayout';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { DashboardStats } from '@/types';

const Dashboard: React.FC = () => {
  const { user, tenant } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    upcomingAppointments: 0,
    customersCount: 0,
    revenueThisMonth: 0
  });
  
  // This would fetch data from API in a real app
  useEffect(() => {
    // Mock data
    setStats({
      totalAppointments: 124,
      upcomingAppointments: 8,
      customersCount: 45,
      revenueThisMonth: 3250
    });
  }, []);

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change?: number;
    color?: 'primary' | 'secondary' | 'success' | 'warning';
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, color = 'primary' }) => {
    const colorClasses: Record<string, string> = {
      primary: 'bg-primary-100/80 text-primary-800',
      secondary: 'bg-emerald-100/80 text-emerald-800',
      success: 'bg-green-100/80 text-green-800',
      warning: 'bg-yellow-100/80 text-yellow-800'
    };

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
                <div className="text-xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
        {change !== undefined && (
          <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-200/50 text-sm">
            <span className={change >= 0 
              ? 'text-green-600 font-medium' 
              : 'text-red-600 font-medium'
            }>
              {change >= 0 ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-gray-500 ml-1">compared to last month</span>
          </div>
        )}
      </Card>
    );
  };

  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);

  return (
    <AppLayout>
      <div className="w-full transition-all duration-300 px-2 sm:px-4 md:px-6 bg-white text-gray-800">
        <div className="border-b border-gray-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Welcome, {user?.name || 'User'}</h2>
            <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
          </div>
          <div className="mt-3 sm:mt-0 flex space-x-3">
            <Button
              variant="glass"
              size="sm"
              rounded="lg"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              }
            >
              New Appointment
            </Button>
          </div>
        </div>

        <div className="animate-fadeIn">
          <h3 className="text-lg leading-6 font-medium text-gray-800 mb-5">
            Overview
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Appointments" 
              value={stats.totalAppointments} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              change={12}
            />
            <StatCard 
              title="Upcoming Appointments" 
              value={stats.upcomingAppointments} 
              color="warning"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard 
              title="Total Customers" 
              value={stats.customersCount} 
              color="secondary"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              change={5}
            />
            <StatCard 
              title="Monthly Revenue" 
              value={`$${stats.revenueThisMonth.toLocaleString()}`} 
              color="success"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              change={-3}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card 
            title="Business Information" 
            padding="lg"
            shadow="md"
            rounded="lg"
            variant="gradient"
            hover="subtle"
            className="transition-all duration-300 bg-white text-gray-800"
          >
            {tenant ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</h4>
                  <p className="mt-1 text-base text-gray-900 font-medium">{tenant.name}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subdomain</h4>
                  <p className="mt-1 text-base text-gray-900">
                    <span className="font-medium">{tenant.subdomain}</span>
                    <span className="text-gray-500">.planca.app</span>
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</h4>
                  <p className="mt-1 text-base text-gray-900">
                    {tenant.address && `${tenant.address}, ${tenant.city}, ${tenant.state} ${tenant.zipCode}`}
                  </p>
                </div>
                <div className="pt-3">
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
                    Edit Business Settings
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-gray-500 mb-6">No business information found.</p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  rounded="lg"
                  className="shadow-md hover:shadow-lg"
                >
                  Create Business
                </Button>
              </div>
            )}
          </Card>

          <Card 
            title="Today's Appointments" 
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
              >
                View All
              </Button>
            }
          >
            <div className="overflow-hidden -mx-6">
              {[1, 2, 3].map((_, index) => (
                <div 
                  key={index} 
                  className={`px-4 sm:px-6 py-4 flex items-center space-x-3 sm:space-x-4 transition-colors duration-200 
                    hover:bg-gray-50/50
                    ${index !== 2 ? 'border-b border-gray-200/50' : ''}`}
                >
                  <div className="flex-shrink-0">
                    <div className={`flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full 
                      ${index === 0 ? 'bg-primary-100 text-primary-800' :
                        index === 1 ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {['JS', 'AK', 'MB'][index]}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {['John Smith', 'Alice King', 'Mark Brown'][index]}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {['Haircut', 'Beard Trim', 'Facial'][index]}
                    </p>
                  </div>
                  <div className="inline-flex items-center text-sm font-semibold">
                    <span className="bg-gray-100 text-gray-800 rounded-full px-2 sm:px-3 py-1">
                      {['14:00', '15:30', '17:15'][index]}
                    </span>
                  </div>
                </div>
              ))}
              
              {[1, 2, 3].length === 0 && (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">No appointments today.</p>
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