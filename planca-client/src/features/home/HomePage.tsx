import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import Button from '@/components/common/Button';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary-900">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-primary from-primary-800 to-primary-950 text-white py-20 md:py-28 hero-section">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 tracking-tight">
            Kolay Randevu Yönetimi
          </h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl mb-10 text-gray-100">
            Güçlü randevu planlama sistemimizle işletmenizi daha verimli hale getirin. Zaman kazanın, randevusuz gelmeleri azaltın ve müşterilerinizi memnun edin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg" className="px-8 bg-white text-primary-700 hover:bg-gray-100 shadow-red-lg btn-hover-lift">
                Hemen Başla
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 text-white border-white hover:bg-white/10 btn-hover-lift">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-secondary-800" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Neden <span className="text-primary-500">Planca</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="feature-card flex flex-col items-center text-center p-8 rounded-xl">
              <div className="feature-icon p-5 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Basit Planlama</h3>
              <p className="text-gray-300">
                Kolayca randevu alın, takviminizi yönetin ve otomatik hatırlatmalar gönderin.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="feature-card flex flex-col items-center text-center p-8 rounded-xl">
              <div className="feature-icon p-5 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">Müşteri Yönetimi</h3>
              <p className="text-gray-300">
                Müşterilerinizi, tercihlerini ve randevu geçmişlerini takip edin.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="feature-card flex flex-col items-center text-center p-8 rounded-xl">
              <div className="feature-icon p-5 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">İş Analitiği</h3>
              <p className="text-gray-300">
                Güçlü analiz ve raporlama araçlarıyla işletmenize dair içgörüler elde edin.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-20 bg-secondary-900" id="pricing">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Fiyatlandırma
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="pricing-card bg-secondary-800 p-8 rounded-xl shadow-dark border border-secondary-700 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-4">Başlangıç</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Ücretsiz</span>
              </div>
              <p className="text-gray-300 mb-8">Küçük işletmeler için ideal başlangıç planı</p>
              <ul className="mb-8 space-y-4 flex-grow">
                <li className="flex items-center pricing-feature pb-4 border-b border-secondary-700">
                  <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-200">5 müşteriye kadar</span>
                </li>
                <li className="flex items-center pricing-feature pb-4 border-b border-secondary-700">
                  <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-200">Basit randevu planlama</span>
                </li>
                <li className="flex items-center pricing-feature pb-4 border-b border-secondary-700">
                  <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-200">E-posta desteği</span>
                </li>
              </ul>
              <Link to="/register">
                <Button variant="outline" className="w-full btn-hover-lift">
                  Kaydol
                </Button>
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="pricing-card highlight bg-secondary-800 p-8 rounded-xl shadow-red-lg border-2 border-primary-600 flex flex-col relative transform scale-105">
              <div className="absolute top-0 -mt-5 left-0 right-0 flex justify-center">
                <span className="bg-primary-600 text-white px-6 py-1 rounded-full text-sm font-bold shadow-lg">Popüler</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Profesyonel</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">₺299</span>
                <span className="text-gray-400">/ay</span>
              </div>
              <p className="text-gray-300 mb-8">Büyüyen işletmeler için ideal plan</p>
              <ul className="mb-8 space-y-4 flex-grow">
                <li className="flex items-center pricing-feature pb-4 border-b border-secondary-700">
                  <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-200">Sınırsız müşteri</span>
                </li>
                <li className="flex items-center pricing-feature pb-4 border-b border-secondary-700">
                  <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-200">Gelişmiş randevu planlama</span>
                </li>
                <li className="flex items-center pricing-feature pb-4 border-b border-secondary-700">
                  <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-200">SMS hatırlatmaları</span>
                </li>
                <li className="flex items-center pricing-feature pb-4 border-b border-secondary-700">
                  <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-200">Öncelikli destek</span>
                </li>
              </ul>
              <Link to="/register">
                <Button variant="primary" className="w-full pulse shadow-red">
                  14 gün ücretsiz deneyin
                </Button>
              </Link>
            </div>
            
            {/* Enterprise Plan */}
            <div className="pricing-card bg-secondary-800 p-8 rounded-xl shadow-dark border border-secondary-700 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-4">Kurumsal</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">₺699</span>
                <span className="text-gray-400">/ay</span>
              </div>
              <p className="text-gray-300 mb-8">Büyük işletmeler için özelleştirilmiş çözümler</p>
              <ul className="mb-8 space-y-4 flex-grow">
                <li className="flex items-center pricing-feature pb-4 border-b border-secondary-700">
                  <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-200">Tüm Pro özellikleri</span>
                </li>
                <li className="flex items-center pricing-feature pb-4 border-b border-secondary-700">
                  <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-200">Çoklu lokasyon desteği</span>
                </li>
                <li className="flex items-center pricing-feature pb-4 border-b border-secondary-700">
                  <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-gray-200">Gelişmiş analitik ve raporlama</span>
                </li>
              </ul>
              <Link to="/contact">
                <Button variant="outline" className="w-full btn-hover-lift">
                  Bizimle iletişime geçin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary from-primary-900 to-primary-950 text-white relative">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            İşletmenizi Daha Verimli Hale Getirmeye Hazır mısınız?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-100">
            Randevularını ve işletmelerini Planca ile yöneten binlerce işletmeye katılın.
          </p>
          <Link to="/register">
            <Button variant="primary" size="lg" className="px-10 shadow-red-lg btn-hover-lift">
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