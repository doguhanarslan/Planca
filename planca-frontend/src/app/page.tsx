// src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '../store';

export default function Home() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="py-20 bg-gradient-to-b from-indigo-500 to-indigo-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Manage Your Appointments With Ease
            </h1>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Planca is a powerful appointment scheduling system designed for salons, spas, and service-based businesses.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {isAuthenticated ? (
                <Link href="/dashboard" className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-150">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-150">
                    Login
                  </Link>
                  <Link href="/register" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-indigo-700 transition duration-150">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
                <p className="text-gray-600">Easily manage appointments, avoid conflicts, and optimize your calendar.</p>
              </div>
              
              <div className="p-6 border rounded-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Customer Management</h3>
                <p className="text-gray-600">Keep track of your customers&apos; information, preferences, and appointment history.</p>
              </div>
              
              <div className="p-6 border rounded-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics & Insights</h3>
                <p className="text-gray-600">Get valuable insights into your business performance and customer patterns.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}