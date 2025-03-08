import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import Button from '@/components/common/Button';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
            Kolay Randevu Yönetimi
          </h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl mb-10">
            Güçlü randevu planlama sistemimizle işletmenizi daha verimli hale getirin. Zaman kazanın, randevusuz gelmeleri azaltın ve müşterilerinizi memnun edin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg" className="px-8 bg-white text-primary-700 hover:bg-gray-100">
                Hemen Başla
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 text-white border-white hover:bg-white/10">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Neden <span className="text-primary-600">Planca</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Basit Planlama</h3>
              <p className="text-gray-600">
                Kolayca randevu alın, takviminizi yönetin ve otomatik hatırlatmalar gönderin.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Müşteri Yönetimi</h3>
              <p className="text-gray-600">
                Müşterilerinizi, tercihlerini ve randevu geçmişlerini takip edin.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">İş Analitiği</h3>
              <p className="text-gray-600">
                Güçlü analiz ve raporlama araçlarıyla işletmenize dair içgörüler elde edin.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-16 bg-gray-50" id="pricing">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Fiyatlandırma
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col">
              <h3 className="text-xl font-bold text-secondary-900 mb-4">Başlangıç</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">Ücretsiz</span>
              </div>
              <p className="text-gray-600 mb-6">Küçük işletmeler için ideal başlangıç planı</p>
              <ul className="mb-6 space-y-3 flex-grow">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  5 müşteriye kadar
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Basit randevu planlama
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  E-posta desteği
                </li>
              </ul>
              <Link to="/register">
                <Button variant="outline" className="w-full">
                  Kaydol
                </Button>
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white p-6 rounded-lg shadow-xl border-2 border-primary-500 flex flex-col relative">
              <div className="absolute top-0 -mt-4 left-0 right-0 flex justify-center">
                <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-bold">Popüler</span>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-4">Profesyonel</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">₺299</span>
                <span className="text-gray-500">/ay</span>
              </div>
              <p className="text-gray-600 mb-6">Büyüyen işletmeler için ideal plan</p>
              <ul className="mb-6 space-y-3 flex-grow">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Sınırsız müşteri
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Gelişmiş randevu planlama
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  SMS hatırlatmaları
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Öncelikli destek
                </li>
              </ul>
              <Link to="/register">
                <Button variant="primary" className="w-full">
                  14 gün ücretsiz deneyin
                </Button>
              </Link>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 flex flex-col">
              <h3 className="text-xl font-bold text-secondary-900 mb-4">Kurumsal</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">₺699</span>
                <span className="text-gray-500">/ay</span>
              </div>
              <p className="text-gray-600 mb-6">Büyük işletmeler için özelleştirilmiş çözümler</p>
              <ul className="mb-6 space-y-3 flex-grow">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Tüm Pro özellikleri
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Çoklu lokasyon desteği
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Gelişmiş analitik ve raporlama
                </li>
              </ul>
              <Link to="/contact">
                <Button variant="outline" className="w-full">
                  Bizimle iletişime geçin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-secondary-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            İşletmenizi Daha Verimli Hale Getirmeye Hazır mısınız?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Randevularını ve işletmelerini Planca ile yöneten binlerce işletmeye katılın.
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg" className="px-10 bg-primary-600 hover:bg-primary-700">
              Ücretsiz Başlayın
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HomePage;