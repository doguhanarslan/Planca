import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { AppLayoutProps, NavigationItem } from '@/types';

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, tenant } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const navigation: NavigationItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg> 
    },
    { 
      name: 'Randevular', 
      href: '/appointments', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    },
    { 
      name: 'Müşteriler', 
      href: '/customers', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    },
    { 
      name: 'Hizmetler', 
      href: '/services', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    },
    { 
      name: 'Ayarlar', 
      href: '/settings', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-secondary-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 transform md:hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col bg-primary-700 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4 bg-primary-800">
            <span className="text-white font-bold text-2xl">Planca</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${location.pathname === item.href
                      ? 'bg-primary-800 text-white'
                      : 'text-white hover:bg-primary-600'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="mr-3 flex-shrink-0 text-white">
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-800">
              <span className="text-white font-bold text-2xl">Planca</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto bg-primary-700">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                      ${location.pathname === item.href
                        ? 'bg-primary-800 text-white'
                        : 'text-white hover:bg-primary-600'
                      }`}
                  >
                    <div className="mr-3 flex-shrink-0 text-white">
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-secondary-800 shadow">
          <button
            className="px-4 text-gray-500 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Menüyü aç</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              {tenant && (
                <h1 className="text-xl text-primary-700 dark:text-primary-400 font-semibold truncate">
                  {tenant.name}
                </h1>
              )}
            </div>
            
            <div className="ml-4 flex items-center">
              {/* Profile dropdown */}
              <div className="relative">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-700 dark:text-primary-200 font-semibold">
                      {user?.name?.charAt(0) || user?.email?.charAt(0)}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                      {user?.name || user?.email || 'Kullanıcı'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded 
                      text-gray-700 dark:text-gray-200 bg-white dark:bg-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-600 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                  >
                    Çıkış
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50 dark:bg-secondary-900">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;