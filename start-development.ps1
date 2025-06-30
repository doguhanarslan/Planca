# Planca Development Environment Starter Script
# Bu script geliştirme ortamını hızlı bir şekilde başlatır

Write-Host "🚀 Planca Development Environment Başlatılıyor..." -ForegroundColor Green

# Check if PostgreSQL is running
Write-Host "📊 PostgreSQL servis durumu kontrol ediliyor..." -ForegroundColor Yellow
$postgresService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($postgresService -and $postgresService.Status -eq "Running") {
    Write-Host "✅ PostgreSQL servisi çalışıyor" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL servisi bulunamadı veya çalışmıyor" -ForegroundColor Red
    Write-Host "   PostgreSQL'i yükleyin ve başlatın: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Read-Host "PostgreSQL'i başlattıktan sonra devam etmek için Enter'a basın"
}

# Check if Node.js is installed
Write-Host "🟢 Node.js kontrol ediliyor..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js yüklü: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js bulunamadı. Lütfen yükleyin: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if .env.development exists for client
$envFile = "planca-client\.env.development"
if (Test-Path $envFile) {
    Write-Host "✅ Client environment dosyası mevcut" -ForegroundColor Green
} else {
    Write-Host "📝 Client environment dosyası oluşturuluyor..." -ForegroundColor Yellow
    "VITE_API_URL=https://localhost:7100/api" | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "✅ Environment dosyası oluşturuldu" -ForegroundColor Green
}

# Install client dependencies if needed
Write-Host "📦 Client bağımlılıkları kontrol ediliyor..." -ForegroundColor Yellow
if (!(Test-Path "planca-client\node_modules")) {
    Write-Host "📥 NPM bağımlılıkları yükleniyor..." -ForegroundColor Yellow
    Set-Location planca-client
    npm install
    Set-Location ..
    Write-Host "✅ NPM bağımlılıkları yüklendi" -ForegroundColor Green
} else {
    Write-Host "✅ Client bağımlılıkları mevcut" -ForegroundColor Green
}

# Start the client in a new terminal
Write-Host "🌐 Client başlatılıyor (yeni terminal)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\planca-client'; npm run dev"

# Wait a bit for client to start
Start-Sleep -Seconds 3

# Instructions for API
Write-Host "" -ForegroundColor White
Write-Host "🔧 API Başlatma Talimatları:" -ForegroundColor Cyan
Write-Host "1. Visual Studio Community'yi açın" -ForegroundColor White
Write-Host "2. Planca.sln dosyasını açın" -ForegroundColor White
Write-Host "3. Planca.API projesini startup project olarak ayarlayın" -ForegroundColor White
Write-Host "4. Debug dropdown'dan 'Development (Chrome)' profilini seçin" -ForegroundColor White
Write-Host "5. F5 tuşuna basarak başlatın" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "📍 Önemli Adresler:" -ForegroundColor Cyan
Write-Host "   • Client: http://localhost:5173" -ForegroundColor White
Write-Host "   • API: https://localhost:7100" -ForegroundColor White
Write-Host "   • Swagger: https://localhost:7100/swagger" -ForegroundColor White
Write-Host "" -ForegroundColor White

Write-Host "💡 İpucu: İlk çalıştırmada database migration'ları otomatik olarak uygulanacak" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White

Write-Host "✨ Development environment hazır!" -ForegroundColor Green
Write-Host "📖 Detaylı bilgi için DEVELOPMENT_SETUP.md dosyasını inceleyin" -ForegroundColor Cyan

Read-Host "Script'i kapatmak için Enter'a basın" 