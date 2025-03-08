import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import Button from '@/components/common/Button';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary-900">
      <Header />
      
      {/* Modern Hero Section with improved visual effects */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-950 text-white 
                         py-24 md:py-32 relative overflow-hidden hero-section">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-500 blur-3xl"></div>
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-primary-600 blur-3xl"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[40%] rounded-full bg-primary-700 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 flex flex-col items-center relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-6 tracking-tight leading-tight">
            Kolay Randevu Yönetimi
          </h1>
          <p className="text-xl md:text-2xl text-center max-w-3xl mb-10 text-gray-100 font-light">
            Güçlü randevu planlama sistemimizle işletmenizi daha verimli hale getirin. Zaman kazanın, randevusuz gelmeleri azaltın ve müşterilerinizi memnun edin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <Button 
                variant="primary" 
                size="lg" 
                className="px-8 bg-white text-primary-700 hover:bg-gray-100 
                          shadow-lg hover:shadow-xl transition-all duration-300 
                          hover:-translate-y-1 transform"
              >
                Hemen Başla
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 text-white border-white hover:bg-white/10 
                          transition-all duration-300 hover:-translate-y-1 transform"
              >
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section with enhanced card styling and effects */}
      <section className="py-24 bg-secondary-800" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
            Neden <span className="text-primary-500 relative">
              Planca
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature cards with hover effects */}
            {[
              {
                title: 'Basit Planlama',
                description: 'Kolayca randevu alın, takviminizi yönetin ve otomatik hatırlatmalar gönderin.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: 'Müşteri Yönetimi',
                description: 'Müşterilerinizi, tercihlerini ve randevu geçmişlerini takip edin.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                title: 'İş Analitiği',
                description: 'Güçlü analiz ve raporlama araçlarıyla işletmenize dair içgörüler elde edin.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="feature-card flex flex-col items-center text-center p-8 rounded-xl
                          bg-secondary-700/50 backdrop-blur-sm 
                          border border-secondary-600 hover:border-primary-600
                          transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl
                          group"
              >
                <div className="feature-icon p-5 rounded-full mb-6 bg-primary-900/50 
                               group-hover:bg-primary-800/70 transition-colors duration-300">
                  <div className="text-primary-400 group-hover:text-primary-300 transition-colors duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-primary-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Modernized Pricing Section */}
      <section className="py-24 bg-secondary-900" id="pricing">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
            Fiyatlandırma
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Pricing card data */}
            {[
              {
                title: 'Başlangıç',
                price: 'Ücretsiz',
                popular: false,
                description: 'Küçük işletmeler için ideal başlangıç planı',
                features: [
                  '5 müşteriye kadar',
                  'Basit randevu planlama',
                  'E-posta desteği'
                ],
                buttonText: 'Kaydol',
                buttonLink: '/register'
              },
              {
                title: 'Profesyonel',
                price: '₺299',
                period: '/ay',
                popular: true,
                description: 'Büyüyen işletmeler için ideal plan',
                features: [
                  'Sınırsız müşteri',
                  'Gelişmiş randevu planlama',
                  'SMS hatırlatmaları',
                  'Öncelikli destek'
                ],
                buttonText: '14 gün ücretsiz deneyin',
                buttonLink: '/register'
              },
              {
                title: 'Kurumsal',
                price: '₺699',
                period: '/ay',
                popular: false,
                description: 'Büyük işletmeler için özelleştirilmiş çözümler',
                features: [
                  'Tüm Pro özellikleri',
                  'Çoklu lokasyon desteği',
                  'Gelişmiş analitik ve raporlama'
                ],
                buttonText: 'Bizimle iletişime geçin',
                buttonLink: '/contact'
              }
            ].map((plan, index) => (
              <div 
                key={index}
                className={`pricing-card 
                            ${plan.popular 
                              ? 'bg-secondary-800 border-2 border-primary-600 relative transform scale-105 z-10 shadow-xl' 
                              : 'bg-secondary-800 border border-secondary-700 shadow-lg'}
                            rounded-xl flex flex-col transition-all duration-300 ease-in-out
                            hover:shadow-2xl hover:-translate-y-1`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-primary-600 text-white px-6 py-1 rounded-full text-sm font-bold shadow-lg">
                      Popüler
                    </span>
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-xl font-bold text-white mb-4">{plan.title}</h3>
                  <div className="mb-6 flex items-baseline">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-400 ml-1">{plan.period}</span>}
                  </div>
                  <p className="text-gray-300 mb-8">{plan.description}</p>
                  
                  <ul className="mb-8 space-y-4 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center pricing-feature pb-4 border-b border-secondary-700">
                        <svg className="h-5 w-5 text-primary-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-200">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={plan.buttonLink}>
                    <Button 
                      variant={plan.popular ? "primary" : "outline"}
                      className={`w-full transition-all duration-300 ${plan.popular ? 'pulse shadow-lg' : ''}`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section with enhanced visual effects */}
      <section className="py-24 bg-gradient-to-br from-primary-900 to-primary-950 text-white relative">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {/* Background pattern elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.png')] opacity-10"></div>
          <div className="absolute -top-[5%] -left-[10%] w-[40%] h-[30%] rounded-full bg-primary-600 blur-3xl"></div>
          <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] rounded-full bg-primary-800 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
            İşletmenizi Daha Verimli Hale Getirmeye Hazır mısınız?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-100 font-light">
            Randevularını ve işletmelerini Planca ile yöneten binlerce işletmeye katılın.
          </p>
          <Link to="/register">
            <Button 
              variant="primary" 
              size="xl" 
              className="px-10 bg-white text-primary-700 hover:bg-gray-50
                        shadow-xl hover:shadow-2xl transition-all duration-300
                        hover:-translate-y-1 transform"
            >
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