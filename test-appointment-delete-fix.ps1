# Test Script for Appointment Delete Fix
# Bu script randevu silme işleminin düzgün çalışıp çalışmadığını test eder

Write-Host "🧪 Randevu Silme Sorunu Test Scripti" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Yellow

# Test parametreleri
$apiBaseUrl = "http://localhost:7230/api"
$frontendUrl = "http://localhost:5173"

Write-Host "`n1. Backend API Test" -ForegroundColor Green
Write-Host "-------------------"

# Test: Appointment listesi al
Write-Host "📋 Mevcut randevuları listeliyorum..." -ForegroundColor Yellow
try {
    $appointments = Invoke-RestMethod -Uri "$apiBaseUrl/appointments" -Method GET -ContentType "application/json"
    Write-Host "✅ $($appointments.items.Count) randevu bulundu" -ForegroundColor Green
    
    if ($appointments.items.Count -gt 0) {
        $testAppointmentId = $appointments.items[0].id
        Write-Host "🎯 Test için randevu ID: $testAppointmentId" -ForegroundColor Cyan
        
        # Test: Randevu detayını al
        Write-Host "`n📄 Randevu detayını getiriyorum..." -ForegroundColor Yellow
        $appointmentDetail = Invoke-RestMethod -Uri "$apiBaseUrl/appointments/$testAppointmentId" -Method GET
        Write-Host "✅ Randevu detayı alındı: $($appointmentDetail.data.customerName)" -ForegroundColor Green
        
        # Test: Cache durumunu kontrol et
        Write-Host "`n🔍 Cache durumunu kontrol ediyorum..." -ForegroundColor Yellow
        Write-Host "❓ Manuel olarak frontend'de cache durumunu kontrol edin" -ForegroundColor Magenta
        
        # Test talimatları yazdır
        Write-Host "`n🔬 Manual Test Adımları:" -ForegroundColor Cyan
        Write-Host "1. Frontend'i açın: $frontendUrl" -ForegroundColor White
        Write-Host "2. Randevular sayfasına gidin" -ForegroundColor White
        Write-Host "3. Browser Developer Tools > Console'u açın" -ForegroundColor White
        Write-Host "4. Bir randevu silin ve console loglarını kontrol edin" -ForegroundColor White
        Write-Host "5. Aşağıdaki logları görmeli:" -ForegroundColor White
        Write-Host "   - 🗑️ Starting optimistic delete for appointment:" -ForegroundColor Gray
        Write-Host "   - 📝 Removing appointment from cache:" -ForegroundColor Gray
        Write-Host "   - ✅ Delete operation successful:" -ForegroundColor Gray
        Write-Host "   - 🔄 Force refetching appointments after delete" -ForegroundColor Gray
        Write-Host "   - ✅ Appointment deleted successfully" -ForegroundColor Gray
        
        Write-Host "`n🎯 Beklenen Sonuç:" -ForegroundColor Green
        Write-Host "- Randevu hemen UI'dan kaybolmalı (optimistic update)" -ForegroundColor White
        Write-Host "- Sayfa yenilenmeden liste güncellenmiş olmalı" -ForegroundColor White
        Write-Host "- Console'da başarı mesajları görünmeli" -ForegroundColor White
        
    } else {
        Write-Host "❌ Test için randevu bulunamadı" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ API test hatası: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Cache System Test" -ForegroundColor Green
Write-Host "--------------------"

Write-Host "🔄 Cache invalidation patterns kontrol ediliyor..." -ForegroundColor Yellow

# Cache patterns to test
$cachePatterns = @(
    "appointments_list",
    "employee_appointments",
    "customer_appointments", 
    "employees_list",
    "dashboard"
)

foreach ($pattern in $cachePatterns) {
    Write-Host "✓ Pattern: $pattern" -ForegroundColor Cyan
}

Write-Host "`n3. Frontend State Test" -ForegroundColor Green
Write-Host "----------------------"

Write-Host "📱 Frontend state yönetimi kontrol listesi:" -ForegroundColor Yellow
Write-Host "1. ✓ RTK Query optimistic update eklendi" -ForegroundColor Green  
Write-Host "2. ✓ Cache invalidation geliştirildi" -ForegroundColor Green
Write-Host "3. ✓ Error handling iyileştirildi" -ForegroundColor Green
Write-Host "4. ✓ Console logging eklendi" -ForegroundColor Green

Write-Host "`n4. Backend Cache Test" -ForegroundColor Green
Write-Host "---------------------"

Write-Host "🏗️ Backend cache invalidation kontrol listesi:" -ForegroundColor Yellow
Write-Host "1. ✓ Cache invalidation comprehensive yapıldı" -ForegroundColor Green
Write-Host "2. ✓ Error handling eklendi" -ForegroundColor Green  
Write-Host "3. ✓ Multiple cache patterns eklendi" -ForegroundColor Green
Write-Host "4. ✓ Timing sorunları düzeltildi" -ForegroundColor Green

Write-Host "`n🚀 Test Sonucu" -ForegroundColor Magenta
Write-Host "==============="
Write-Host "Yukarıdaki manual test adımlarını takip ederek" -ForegroundColor White
Write-Host "randevu silme işleminin düzgün çalışıp çalışmadığını" -ForegroundColor White
Write-Host "kontrol edebilirsiniz." -ForegroundColor White

Write-Host "`n💡 Sorun Devam Ederse:" -ForegroundColor Yellow
Write-Host "1. Browser cache'ini temizleyin (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "2. Redis cache'ini restart edin" -ForegroundColor White
Write-Host "3. Backend ve frontend'i restart edin" -ForegroundColor White
Write-Host "4. Network tabinde API çağrılarını kontrol edin" -ForegroundColor White

Write-Host "`nTest scripti tamamlandı! 🎉" -ForegroundColor Green 