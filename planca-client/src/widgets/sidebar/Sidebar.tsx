import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationItem, SidebarProps, User } from '@/shared/types';



const Sidebar: FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  navigation,
  user,
  
}) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile sidebar backdrop with improved transition */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur-md transition-all duration-300 ease-in-out md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile sidebar with improved animations */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col transition-all ease-in-out duration-300 transform md:hidden
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col bg-gradient-to-b from-red-900 to-red-950 text-white rounded-r-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-5 border-b border-red-700/50">
            <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-white font-bold text-xl">Planca<span className="text-yellow-400">.</span></span>
              </div>
            </div>
            <button
              className="ml-1 flex items-center justify-center h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-red-800/70 transition-colors duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Menüyü kapat</span>
              <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 h-0 overflow-y-auto px-3 py-2">
            <nav className="mt-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-all duration-200 ${
                    location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                      ? 'bg-white text-red-700 shadow-md'
                      : 'text-white hover:bg-white/10 hover:shadow-sm'
                  }`}
                >
                  <div className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                      ? 'text-red-700'
                      : 'text-white'
                  }`}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-red-700/50 bg-red-900/30">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full ring-2 ring-white/30 shadow-lg"
                  src={`https://ui-avatars.com/api/?name=${user?.name || 'Kullanıcı'}&background=990000&color=fff&bold=true`}
                  alt="User avatar"
                />
              </div>
              <div className="ml-3 py-1 flex-1 min-w-0">
                <p className="text-base font-medium text-white truncate">{user?.name || 'Kullanıcı'}</p>
                <Link to="/settings" className="text-sm font-medium text-gray-100 hover:text-white transition-colors duration-200">
                  Ayarları Görüntüle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar with collapsible functionality */}
      <div className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:w-20' : 'md:w-72'}`}>
        <div className={`flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-72'} transition-all duration-300 ease-in-out`}>
          <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-red-800 to-red-900 shadow-xl rounded-r-xl">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-between px-4 mb-6">
                {!sidebarCollapsed && (
                  <span className="text-white font-bold text-lg">Planca<span className="text-yellow-400">.</span></span>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1.5 rounded-md hover:bg-red-800/50 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors duration-200"
                  title={sidebarCollapsed ? "Genişlet" : "Daralt"}
                >
                  {sidebarCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  )}
                </button>
              </div>
              <nav className="flex-1 px-3 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                        ? 'bg-white text-red-700 shadow-md'
                        : 'text-white hover:bg-white/10'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <div className={`flex-shrink-0 h-5 w-5 ${
                      location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                        ? 'text-red-700'
                        : 'text-white group-hover:text-white'
                    }`}>
                      {item.icon}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="ml-3 truncate">{item.name}</span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-red-700/50 p-4 bg-red-900/30">
              <div className="flex-shrink-0 w-full group block">
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                  <div className="flex-shrink-0">
                    <img
                      className="inline-block h-9 w-9 rounded-full shadow-lg"
                      src={`https://ui-avatars.com/api/?name=${user?.name || 'Kullanıcı'}&background=990000&color=fff&bold=true`}
                      alt="User avatar"
                    />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate max-w-[8rem]">{user?.name || 'Kullanıcı'}</p>
                      <Link to="/settings" className="block text-xs font-medium text-gray-100 hover:text-white transition-colors duration-200">
                        Ayarlar
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
