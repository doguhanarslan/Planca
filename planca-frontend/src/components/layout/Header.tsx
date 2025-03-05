// src/components/layout/Header.tsx
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch,useAppSelector } from '@/store';
import { logout, fetchTenant } from '../../store/slices/authSlice';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const { name: tenantName } = useAppSelector(state => state.auth.tenant);

  useEffect(() => {
    // Kimlik doğrulaması yapıldığında tenant bilgilerini yükle
    if (isAuthenticated) {
      dispatch(fetchTenant());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Planca
          </Link>
          {tenantName && <span className="text-gray-500">| {tenantName}</span>}
        </div>
        
        <nav>
          <ul className="flex space-x-6">
            {isAuthenticated ? (
              <>
                <li>
                  <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600">
                    Dashboard
                  </Link>
                </li>
                {user?.roles.includes('Admin') && (
                  <li>
                    <Link href="/admin" className="text-gray-600 hover:text-indigo-600">
                      Admin
                    </Link>
                  </li>
                )}
                <li>
                  <span className="text-gray-400 mr-2">
                    {user?.userName}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="text-gray-600 hover:text-indigo-600">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-600 hover:text-indigo-600">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;