// src/components/dashboard/DashboardContent.tsx
import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import Link from 'next/link';

const DashboardContent: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Here you would fetch the upcoming appointments from the API
    // This is a placeholder until we implement the API calls
    setTimeout(() => {
      setUpcomingAppointments([]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const isAdmin = user?.roles.includes('Admin');
  const isEmployee = user?.roles.includes('Employee');
  const isCustomer = user?.roles.includes('Customer');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Upcoming Appointments */}
      <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {/* Appointment items would go here */}
            <p>No appointments to display.</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-md p-6 text-center">
            <p className="text-gray-600 mb-4">You don&apos;t have any upcoming appointments.</p>
            <Link href="/appointments/new" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Book an Appointment
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="col-span-1 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="space-y-3">
          <Link href="/appointments/new" className="block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-150">
            New Appointment
          </Link>
          
          {isAdmin && (
            <>
              <Link href="/customers" className="block w-full text-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-150">
                Manage Customers
              </Link>
              
              <Link href="/employees" className="block w-full text-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-150">
                Manage Employees
              </Link>
              
              <Link href="/services" className="block w-full text-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-150">
                Manage Services
              </Link>
            </>
          )}
          
          {isEmployee && (
            <Link href="/schedule" className="block w-full text-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-150">
              View My Schedule
            </Link>
          )}
          
          {isCustomer && (
            <Link href="/profile" className="block w-full text-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-150">
              My Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;