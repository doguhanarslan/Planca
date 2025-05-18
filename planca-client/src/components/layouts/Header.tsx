import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import Button from '@/components/common/Button';

/**
 * Modern responsive Header component with enhanced interactions
 */
const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Track scroll position to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const navItems = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Özellikler', href: '/#features' },
    { name: 'Fiyatlandırma', href: '/#pricing' },
    { name: 'Hakkımızda', href: '/about' },
  ];

  return (
    <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-md' : ''
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo with enhanced animation */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              {/* App Logo */}
              <div className="w-10 h-10 mr-2 bg-red-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="font-bold text-2xl text-primary-600 group-hover:text-primary-500 transition-colors duration-300 transform">
                Planca
                <span className="text-gray-800 group-hover:text-gray-600 ml-1 transition-colors duration-300">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation with improved hover effects */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-base font-medium text-black hover:text-red-600 transition-all duration-200 relative group ${
                  location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                    ? 'text-black'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full ${
                  location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                    ? 'w-full'
                    : 'w-0'
                }`}></span>
              </Link>
            ))}
          </nav>

          {/* Authentication buttons with enhanced styling */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button 
                  variant="primary" 
                  size="sm"
                  rounded="lg"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  }
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    size="sm"
                    rounded="lg"
                    className="border-black shadow-sm hover:shadow-md bg-black transition-all duration-300 text-white hover:bg-white hover:text-black hover:border-black"
                  >
                    Giriş Yap
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    rounded="lg"
                    className="shadow-sm hover:shadow-md transition-all border-red-500 bg-red-500 duration-300 text-white hover:bg-red-600 hover:border-red-600"
                  >
                    Kayıt Ol
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Modern mobile menu button with animation */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Ana menüyü aç</span>
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span
                  className={`absolute block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                    mobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'
                  }`}
                ></span>
                <span
                  className={`absolute block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                ></span>
                <span
                  className={`absolute block h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                    mobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Improved mobile menu with smooth transitions */}
      <div
        className={`md:hidden bg-white border-t border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          <div className="pt-4 space-y-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="block w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="primary"
                  fullWidth
                  rounded="lg"
                  className="justify-center"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  }
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="outline"
                    fullWidth
                    rounded="lg"
                    className="justify-center border-black bg-black text-white hover:bg-white hover:text-black"
                  >
                    Giriş Yap
                  </Button>
                </Link>
                <Link
                  to="/register"
                  className="block w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="primary"
                    fullWidth
                    rounded="lg"
                    className="justify-center bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600"
                  >
                    Kayıt Ol
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;