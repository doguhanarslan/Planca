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
      primary: 'bg-primary-100 text-primary-800',
      secondary: 'bg-secondary-100 text-secondary-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Card className="overflow-hidden">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-full p-3 ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
        {change !== undefined && (
          <div className="mt-3 text-sm">
            <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="border-b border-gray-200 pb-5 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Welcome, {user?.name || 'User'}</h2>
            <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
          </div>
          <div className="mt-3 sm:mt-0 flex space-x-3">
            <Button
              variant="primary"
              size="sm"
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

        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Overview
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
              value={`$${stats.revenueThisMonth}`} 
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

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card 
            title="Business Information" 
            padding="lg"
            shadow="lg"
            rounded="lg"
          >
            {tenant ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</h4>
                  <p className="mt-1 text-sm text-gray-900">{tenant.name}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subdomain</h4>
                  <p className="mt-1 text-sm text-gray-900">{tenant.subdomain}.planca.app</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {tenant.address && `${tenant.address}, ${tenant.city}, ${tenant.state} ${tenant.zipCode}`}
                  </p>
                </div>
                <div className="pt-3">
                  <Button variant="outline" size="sm">
                    Edit Business Settings
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No business information found.</p>
                <Button variant="primary" className="mt-4" size="sm">
                  Create Business
                </Button>
              </div>
            )}
          </Card>

          <Card 
            title="Today's Appointments" 
            padding="lg"
            shadow="lg"
            rounded="lg"
            actions={
              <Button variant="outline" size="sm">
                View All
              </Button>
            }
          >
            <div className="overflow-hidden">
              {[1, 2, 3].map((_, index) => (
                <div 
                  key={index} 
                  className={`p-4 flex items-center space-x-4 ${
                    index !== 2 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-800">
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
                  <div className="inline-flex items-center text-sm font-medium text-gray-700">
                    {['14:00', '15:30', '17:15'][index]}
                  </div>
                </div>
              ))}
              
              {[1, 2, 3].length === 0 && (
                <div className="text-center py-4">
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