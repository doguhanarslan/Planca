import { FC, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { AppLayoutProps, NavigationItem } from '@/shared/types';
import Sidebar from '@/widgets/sidebar/Sidebar';

const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, tenant } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close sidebar on route change for mobile view
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Update localStorage when sidebarCollapsed changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const profileMenu = document.getElementById('profile-menu');
      if (profileMenu && !profileMenu.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen for window resize to adjust responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById('user-menu');
      if (userMenu && !userMenu.contains(event.target as Node) && showUserMenu) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const navigation: NavigationItem[] = [
    { 
      name: 'Panel', 
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
      name: 'Personeller', 
      href: '/employees', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
    <div className="h-screen flex overflow-hidden bg-gray-50 text-black">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        navigation={navigation}
        user={user} />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <button
            type="button"
            className="md:hidden px-4 text-gray-600 hover:text-red-700 focus:outline-none transition-all duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Menüyü aç</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          
          {/* Enhanced header area with centered logo and improved icons */}
          <div className="flex-1 px-4 flex items-center justify-between">
            {/* Left side: Dynamic Page Title & Icon */}
            <div className="flex items-center">
              <div className="flex items-center">
                
                <h1 className="text-xl font-semibold text-black">
                  {navigation.find(item => 
                    location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href))
                  )?.name || 'Panel'}
                </h1>
              </div>
            </div>

            {/* Center: Planca Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center">
              <div className="flex items-center">
                <span className=" font-serif text-[1.8rem] text-black">
                  Planca
                  <span className="text-red-600">.</span>
                </span>
              </div>
            </div>
            
            {/* Right side: User menu and notifications */}
            <div className="flex items-center md:ml-6 space-x-4">
              <button
                type="button"
                className="p-1.5 text-gray-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-all duration-200 focus:outline-none "
              >
                <span className="sr-only">Bildirimleri Görüntüle</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              
              <div className="relative" id="user-menu">
                <button
                  type="button"
                  className="p-1.5 text-gray-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-all duration-200 focus:outline-none  flex items-center group"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="sr-only">Kullanıcı menüsünü aç</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-xl shadow-lg py-1 bg-white ring-1 focus:outline-none z-30 transition-all duration-200 ease-in-out transform">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-600 font-medium">Giriş yapan</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.email || 'kullanici@ornek.com'}</p>
                    </div>
                    
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profilim
                      </div>
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ayarlar
                      </div>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Çıkış Yap
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-white">
          <div className="max-w-8xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;