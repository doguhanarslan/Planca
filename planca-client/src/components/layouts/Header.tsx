import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import Button from '@/components/common/Button';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Apply dark mode class to body
  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  const navItems = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Özellikler', href: '/#features' },
    { name: 'Fiyatlandırma', href: '/#pricing' },
    { name: 'Hakkımızda', href: '/about' },
  ];

  return (
    <header className="bg-secondary-900 border-b border-secondary-700 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="font-bold text-2xl text-primary-600 group-hover:text-primary-500 transition-colors duration-200">
                Planca
                <span className="text-white group-hover:text-gray-200 ml-1 transition-colors duration-200">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-base font-medium transition-colors duration-200 ${
                  location.pathname === item.href
                    ? 'text-primary-500'
                    : 'text-gray-300 hover:text-primary-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Authentication buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button 
                  variant="primary" 
                  size="sm"
                  className="shadow-sm hover:shadow-md transition-shadow"
                >
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-600 text-gray-200 hover:bg-secondary-800"
                  >
                    Giriş Yap
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    Kayıt Ol
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              type="button"
              className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Ana menüyü aç</span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`md:hidden bg-secondary-800 border-t border-secondary-700 transition-all duration-200 ease-in-out overflow-hidden ${
          mobileMenuOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                location.pathname === item.href
                  ? 'text-primary-400 bg-secondary-900' 
                  : 'text-gray-300 hover:text-primary-400 hover:bg-secondary-900'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-secondary-900 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;