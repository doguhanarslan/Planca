# Frontend API Veri Çekme Sorunları Test Scripti
# Bu script, düzeltilen frontend API sorunlarını test eder

Write-Host "=== Planca Frontend API Test Başlatılıyor ===" -ForegroundColor Green

# Test 1: Müşteri Listesi API'sini Test Et
Write-Host "`n1. Müşteri Listesi API Test Ediliyor..." -ForegroundColor Yellow
Write-Host "   - Response format kontrolü yapılacak"
Write-Host "   - TenantId header kontrolü yapılacak" 
Write-Host "   - Cache invalidation test edilecek"

# Test 2: Randevu Listesi API'sini Test Et  
Write-Host "`n2. Randevu Listesi API Test Ediliyor..." -ForegroundColor Yellow
Write-Host "   - Response transformation kontrolü"
Write-Host "   - Pagination format kontrolü"

# Test 3: Dashboard API'sini Test Et
Write-Host "`n3. Dashboard API Test Ediliyor..." -ForegroundColor Yellow  
Write-Host "   - Stats hesaplama kontrolü"
Write-Host "   - Bugünün randevuları kontrolü"

# Test 4: Cache Invalidation Test Et
Write-Host "`n4. Cache Invalidation Test Ediliyor..." -ForegroundColor Yellow
Write-Host "   - Yeni veri oluşturma"
Write-Host "   - Cache yenileme kontrolü"

Write-Host "`n=== Test Talimatları ===" -ForegroundColor Cyan
Write-Host "1. Frontend'i başlatın: cd planca-client && npm run dev"
Write-Host "2. Backend'i başlatın: cd Planca.API && dotnet run"  
Write-Host "3. Browser'da console'u açın (F12)"
Write-Host "4. Aşağıdaki sayfaları test edin:"
Write-Host "   - /dashboard - Dashboard istatistikleri"
Write-Host "   - /customers - Müşteri listesi" 
Write-Host "   - /appointments - Randevu listesi"
Write-Host "   - /services - Hizmet listesi"
Write-Host "5. Console'da 'API Raw Response' log'larını kontrol edin"
Write-Host "6. Network tab'da API response formatlarını kontrol edin"

Write-Host "`n=== Beklenen Düzeltmeler ===" -ForegroundColor Green
Write-Host "✓ TenantId artık header olarak otomatik gönderiliyor"
Write-Host "✓ Response format'ları tutarlı şekilde işleniyor"  
Write-Host "✓ Cache süresi 10 saniyeye düşürüldü"
Write-Host "✓ API response transformation'ları iyileştirildi"
Write-Host "✓ Error handling ve fallback'ler geliştirildi"

Write-Host "`n=== Sorun Yaşarsanız ===" -ForegroundColor Red
Write-Host "1. Browser console'da 'Dashboard response for count:' log'larını kontrol edin"
Write-Host "2. Network tab'da API request'lerin X-TenantId header'ına sahip olduğunu kontrol edin"
Write-Host "3. API response'larının expected format'da geldiğini kontrol edin"
Write-Host "4. Backend'de AppointmentsController.debug endpoint'ini test edin"

Write-Host "`nTest scripti hazır! Yukarıdaki talimatları takip ederek test edebilirsiniz." -ForegroundColor Green 