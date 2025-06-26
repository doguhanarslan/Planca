# Frontend State ve Cache Güncellemesi Test Scripti
# Bu script yapılan düzeltmeleri test eder

Write-Host "🧪 Frontend State ve Cache Güncellemesi Test Başlatılıyor..." -ForegroundColor Green

Write-Host "`n=== Düzeltilen Problemler ===" -ForegroundColor Yellow
Write-Host "✅ RTK Query cache invalidation geliştirmeleri" -ForegroundColor Green
Write-Host "✅ Optimistic updates eklendi (appointments)" -ForegroundColor Green
Write-Host "✅ Real-time refetch konfigürasyonu (refetchOnFocus, refetchOnReconnect)" -ForegroundColor Green
Write-Host "✅ keepUnusedDataFor: 5 saniye (daha agresif cache temizleme)" -ForegroundColor Green
Write-Host "✅ Global cache invalidation utility fonksiyonları" -ForegroundColor Green
Write-Host "✅ Her sayfa için özel cache invalidation stratejileri" -ForegroundColor Green

Write-Host "`n=== Test Adımları ===" -ForegroundColor Cyan
Write-Host "1. Frontend'i başlat: cd planca-client && npm run dev" -ForegroundColor White
Write-Host "2. Browser console'u aç (F12)" -ForegroundColor White
Write-Host "3. Network tab'ını aç (cache isteklerini görmek için)" -ForegroundColor White

Write-Host "`n=== Test Senaryoları ===" -ForegroundColor Yellow

Write-Host "`n📅 Randevular Sayfası (Appointments)" -ForegroundColor Cyan
Write-Host "1. Randevular sayfasına git (/appointments)" -ForegroundColor White
Write-Host "2. Yeni randevu oluştur" -ForegroundColor White
Write-Host "3. Kontrol et: Lista hemen güncelleniyor mu?" -ForegroundColor White
Write-Host "4. Bir randevuyu düzenle" -ForegroundColor White
Write-Host "5. Kontrol et: Optimistic update çalışıyor mu?" -ForegroundColor White
Write-Host "6. Console'da şu log'ları ara:" -ForegroundColor White
Write-Host "   - '🔄 Starting cache invalidation...'" -ForegroundColor Gray
Write-Host "   - '✅ Cache invalidation completed'" -ForegroundColor Gray

Write-Host "`n👥 Müşteriler Sayfası (Customers)" -ForegroundColor Cyan
Write-Host "1. Müşteriler sayfasına git (/customers)" -ForegroundColor White
Write-Host "2. Yeni müşteri ekle" -ForegroundColor White
Write-Host "3. Kontrol et: Liste hemen güncelleniyor mu?" -ForegroundColor White
Write-Host "4. Bir müşteriyi düzenle" -ForegroundColor White
Write-Host "5. Müşteriyi sil" -ForegroundColor White
Write-Host "6. Her işlemde cache invalidation log'larını kontrol et" -ForegroundColor White

Write-Host "`n👨‍💼 Çalışanlar Sayfası (Employees)" -ForegroundColor Cyan
Write-Host "1. Çalışanlar sayfasına git (/employees)" -ForegroundColor White
Write-Host "2. Yeni çalışan ekle" -ForegroundColor White
Write-Host "3. Bir çalışanın detayına git" -ForegroundColor White
Write-Host "4. Çalışan bilgilerini düzenle" -ForegroundColor White
Write-Host "5. Kontrol et: 'Employee cache invalidation completed' log'u var mı?" -ForegroundColor White

Write-Host "`n📊 Dashboard Sayfası" -ForegroundColor Cyan
Write-Host "1. Dashboard'a git (/dashboard)" -ForegroundColor White
Write-Host "2. Başka sayfada bir değişiklik yap" -ForegroundColor White
Write-Host "3. Dashboard'a geri dön" -ForegroundColor White
Write-Host "4. Kontrol et: İstatistikler güncellendi mi?" -ForegroundColor White
Write-Host "5. Browser tab'ını değiştir ve geri gel (refetchOnFocus testi)" -ForegroundColor White

Write-Host "`n🛠️ Hizmetler Sayfası (Services)" -ForegroundColor Cyan
Write-Host "1. Hizmetler sayfasına git (/services)" -ForegroundColor White
Write-Host "2. Yeni hizmet ekle" -ForegroundColor White
Write-Host "3. Bir hizmeti düzenle" -ForegroundColor White
Write-Host "4. Hizmeti sil" -ForegroundColor White
Write-Host "5. Kontrol et: Her işlemde liste güncelleniyor mu?" -ForegroundColor White

Write-Host "`n🧹 Cache Temizleme Testi" -ForegroundColor Cyan
Write-Host "1. Browser console'a git" -ForegroundColor White
Write-Host "2. Bu komutu çalıştır:" -ForegroundColor White
Write-Host "   window.store.dispatch(window.baseApi.util.resetApiState())" -ForegroundColor Gray
Write-Host "3. Sayfayı yenile" -ForegroundColor White
Write-Host "4. Kontrol et: Tüm veriler yeniden yükleniyor mu?" -ForegroundColor White

Write-Host "`n⚡ Performance Test" -ForegroundColor Cyan
Write-Host "1. Chrome DevTools Performance tab'ını aç" -ForegroundColor White
Write-Host "2. Recording başlat" -ForegroundColor White
Write-Host "3. Birkaç CRUD işlemi yap" -ForegroundColor White
Write-Host "4. Recording'i durdur" -ForegroundColor White
Write-Host "5. Kontrol et: Gereksiz render var mı?" -ForegroundColor White

Write-Host "`n🔧 Debugging" -ForegroundColor Cyan
Write-Host "1. Redux DevTools Extension kullan" -ForegroundColor White
Write-Host "2. RTK Query actions'larını izle" -ForegroundColor White
Write-Host "3. Cache state'ini kontrol et" -ForegroundColor White
Write-Host "4. Invalidation action'larını ara" -ForegroundColor White

Write-Host "`n=== Başarı Kriterleri ===" -ForegroundColor Green
Write-Host "✅ Randevu oluşturma/güncelleme anında listede görünür" -ForegroundColor White
Write-Host "✅ Müşteri/çalışan işlemleri hemen yansır" -ForegroundColor White
Write-Host "✅ Dashboard istatistikleri real-time güncellenir" -ForegroundColor White
Write-Host "✅ Tab değiştirmede otomatik refetch çalışır" -ForegroundColor White
Write-Host "✅ Internet bağlantısı kesilip geldiğinde otomatik sync" -ForegroundColor White
Write-Host "✅ Console'da cache invalidation log'ları görünür" -ForegroundColor White
Write-Host "✅ Network tab'ında gereksiz request yok" -ForegroundColor White

Write-Host "`n⚠️  Bilinen Sınırlamalar" -ForegroundColor Yellow
Write-Host "- Cache 5 saniye boyunca tutulur (performans için)" -ForegroundColor White
Write-Host "- Optimistic updates sadece appointment update'de aktif" -ForegroundColor White
Write-Host "- Real-time websocket henüz yok (manuel refetch)" -ForegroundColor White

Write-Host "`n🎯 Test Tamamlandıktan Sonra" -ForegroundColor Green
Write-Host "1. Tüm senaryoları test et" -ForegroundColor White
Write-Host "2. Hataları raporla" -ForegroundColor White
Write-Host "3. Performance sorunlarını belirle" -ForegroundColor White
Write-Host "4. Cache stratejisini optimize et" -ForegroundColor White

Write-Host "`nTest başarıyla kuruldu! 🚀" -ForegroundColor Green 