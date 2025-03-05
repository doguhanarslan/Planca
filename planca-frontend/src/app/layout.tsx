// src/app/layout.tsx
'use client';

import '../styles/globals.css'
import React from 'react';
import { Inter } from 'next/font/google';
import { Provider } from 'react-redux';
import { store } from '../store';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Provider store={store}>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Provider>
      </body>
    </html>
  );
}