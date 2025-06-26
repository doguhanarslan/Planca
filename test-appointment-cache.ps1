# Randevu Cache Invalidation Test Scripti
# Bu script randevu listesi sorunlarını test eder

Write-Host "🧪 Randevu Cache Invalidation Test Başlatılıyor..." -ForegroundColor Green

Write-Host "`n=== Tespit Edilen Sorunlar ===" -ForegroundColor Yellow
Write-Host "1. Randevu oluşturulduğunda listede geç yansıyor" -ForegroundColor White
Write-Host "2. Randevu güncellendiğinde liste görünmez oluyor" -ForegroundColor White
Write-Host "3. RTK Query cache invalidation sorunları" -ForegroundColor White

Write-Host "`n=== Yapılan Düzeltmeler ===" -ForegroundColor Green
Write-Host "✓ provideTags ve invalidatesTags daha spesifik hale getirildi" -ForegroundColor Green
Write-Host "✓ Cache invalidation 'LIST' tag'i eklendi" -ForegroundColor Green
Write-Host "✓ Dashboard cache'i de invalidate ediliyor" -ForegroundColor Green
Write-Host "✓ Polling interval eklendi (30s list, 60s calendar)" -ForegroundColor Green
Write-Host "✓ refetchOnMountOrArgChange: true yapıldı" -ForegroundColor Green
Write-Host "✓ Modern tasarım customers/employees stil ile uyumlu" -ForegroundColor Green

Write-Host "`n=== Test Adımları ===" -ForegroundColor Cyan
Write-Host "1. Frontend'i başlat: cd planca-client && npm run dev" -ForegroundColor White
Write-Host "2. Randevular sayfasına git: http://localhost:3000/appointments" -ForegroundColor White
Write-Host "3. Browser console'u aç (F12)" -ForegroundColor White

Write-Host "`n=== Cache Test Senaryoları ===" -ForegroundColor Yellow

Write-Host "`n📝 Test 1: Randevu Oluşturma" -ForegroundColor Cyan
Write-Host "1. 'Yeni Randevu' butonuna tıkla" -ForegroundColor White
Write-Host "2. Randevu formunu doldur ve kaydet" -ForegroundColor White
Write-Host "3. Console'da şu log'ları kontrol et:" -ForegroundColor White
Write-Host "   - 'Appointment operation successful, invalidating cache...'" -ForegroundColor Gray
Write-Host "   - 'Cache invalidation completed'" -ForegroundColor Gray
Write-Host "4. Randevunun hemen listede/takvimde görünmesini kontrol et" -ForegroundColor White

Write-Host "`n✏️ Test 2: Randevu Güncelleme" -ForegroundColor Cyan
Write-Host "1. Bir randevuyu edit et" -ForegroundColor White
Write-Host "2. Değişiklikleri kaydet" -ForegroundColor White
Write-Host "3. Console'da cache invalidation log'larını kontrol et" -ForegroundColor White
Write-Host "4. Değişikliklerin hemen yansıdığını kontrol et" -ForegroundColor White
Write-Host "5. DİKKAT: Tüm liste kaybolmamalı!" -ForegroundColor Red

Write-Host "`n🔄 Test 3: Otomatik Refresh" -ForegroundColor Cyan
Write-Host "1. Randevular sayfasında kal" -ForegroundColor White
Write-Host "2. Console'da her 30 saniyede API çağrısı yapıldığını kontrol et" -ForegroundColor White
Write-Host "3. Network tab'da polling request'lerini gör" -ForegroundColor White

Write-Host "`n🌐 Test 4: Window Focus Refresh" -ForegroundColor Cyan
Write-Host "1. Başka bir tab'a geç" -ForegroundColor White
Write-Host "2. Randevular tab'ına geri dön" -ForegroundColor White
Write-Host "3. Console'da refresh log'unu kontrol et" -ForegroundColor White

Write-Host "`n📊 Test 5: Dashboard Integration" -ForegroundColor Cyan
Write-Host "1. Yeni randevu oluştur" -ForegroundColor White
Write-Host "2. Dashboard'a git" -ForegroundColor White
Write-Host "3. İstatistiklerin güncellendiğini kontrol et" -ForegroundColor White

Write-Host "`n=== Kontrol Edilecek Console Log'ları ===" -ForegroundColor Yellow
Write-Host "✓ 'Processing appointments data:' - Veri işleme" -ForegroundColor Green
Write-Host "✓ 'Calendar processing appointments data:' - Takvim veri işleme" -ForegroundColor Green
Write-Host "✓ 'Calendar refreshTrigger fired' - Takvim yenileme" -ForegroundColor Green
Write-Host "✓ 'Create/Update Appointment Response:' - Mutation yanıtları" -ForegroundColor Green
Write-Host "✓ 'Cache invalidation completed' - Cache yenileme tamamlandı" -ForegroundColor Green

Write-Host "`n=== Beklenen Davranışlar ===" -ForegroundColor Green
Write-Host "✅ Randevu oluşturma sonrası hemen liste yenilenmeli" -ForegroundColor Green
Write-Host "✅ Randevu güncelleme sonrası tüm liste görünür kalmalı" -ForegroundColor Green
Write-Host "✅ Cache invalidation log'ları görünmeli" -ForegroundColor Green
Write-Host "✅ Otomatik polling çalışmalı" -ForegroundColor Green
Write-Host "✅ Window focus'da refresh yapmalı" -ForegroundColor Green

Write-Host "`n=== Hata Durumları ===" -ForegroundColor Red
Write-Host "❌ Randevu oluşturduktan sonra liste boş kalırsa" -ForegroundColor Red
Write-Host "❌ Randevu güncelledikten sonra liste kaybolursa" -ForegroundColor Red
Write-Host "❌ Console'da cache invalidation log'ları görünmezse" -ForegroundColor Red
Write-Host "❌ Polling çalışmazsa (Network tab'da request yok)" -ForegroundColor Red

Write-Host "`n📝 Sorun Bildirimi:" -ForegroundColor Cyan
Write-Host "Eğer sorunlar devam ederse şu bilgileri toplayın:" -ForegroundColor White
Write-Host "1. Console'daki tam hata mesajları" -ForegroundColor White
Write-Host "2. Network tab'daki API request'ler" -ForegroundColor White
Write-Host "3. Hangi test senaryosunda sorun oluştu" -ForegroundColor White
Write-Host "4. Browser ve işletim sistemi bilgisi" -ForegroundColor White

Write-Host "`n🎉 Test tamamlandı! Yukarıdaki adımları takip ederek randevu cache sorunlarını test edin." -ForegroundColor Green 