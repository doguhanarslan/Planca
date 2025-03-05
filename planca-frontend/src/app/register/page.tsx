// src/app/register/page.tsx
'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import RegisterForm from '../../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Planca and start managing your appointments
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <RegisterForm />
        </div>
      </div>
    </Provider>
  );
}