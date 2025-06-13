# Local Docker Test Script for Planca
# Bu script uygulamanızı local'de Docker ile test etmenizi sağlar

Write-Host "🐳 Planca Local Docker Test başlatılıyor..." -ForegroundColor Green

# Docker ve Docker Compose kontrolü
Write-Host "Docker servislerini kontrol ediliyor..."
try {
    docker --version
    docker-compose --version
    Write-Host "✅ Docker servisleri hazır" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Desktop çalışır durumda değil!" -ForegroundColor Red
    Write-Host "Lütfen Docker Desktop'ı başlatın ve tekrar deneyin." -ForegroundColor Yellow
    exit 1
}

# Mevcut container'ları temizle
Write-Host "Mevcut container'ları temizleniyor..."
docker-compose down --remove-orphans

# Dockerfile'ları kontrol et
Write-Host "Docker dosyalarını kontrol ediliyor..."
$requiredFiles = @(
    "Planca.API/Dockerfile",
    "planca-client/Dockerfile", 
    "planca-client/nginx.conf",
    "planca-client/env.sh",
    "docker-compose.yml"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Gerekli dosya bulunamadı: $file" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Tüm Docker dosyları mevcut" -ForegroundColor Green

# Build ve start
Write-Host "Container'lar build ediliyor ve başlatılıyor..."
docker-compose up --build -d

Write-Host "Container durumları kontrol ediliyor..."
Start-Sleep -Seconds 10

# Container durumlarını kontrol et
$containers = docker-compose ps --services
foreach ($container in $containers) {
    $status = docker-compose ps $container
    Write-Host "📦 Container: $container" -ForegroundColor Cyan
    Write-Host "$status" -ForegroundColor Gray
}

# Health check
Write-Host ""
Write-Host "🔍 Health check'ler yapılıyor..."

# API health check
try {
    Write-Host "API health check: http://localhost:8080/health"
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 10
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "✅ API çalışıyor" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ API health check başarısız: $_" -ForegroundColor Yellow
}

# Frontend health check
try {
    Write-Host "Frontend health check: http://localhost:3000/health"
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend çalışıyor" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Frontend health check başarısız: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Test URL'leri:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "🔗 API: http://localhost:8080" -ForegroundColor White
Write-Host "🔗 API Swagger: http://localhost:8080/swagger" -ForegroundColor White
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🗄️ Database: localhost:5432" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host ""
Write-Host "📋 Faydalı Komutlar:" -ForegroundColor Cyan
Write-Host "docker-compose logs -f api        # API logları" -ForegroundColor Gray
Write-Host "docker-compose logs -f frontend   # Frontend logları" -ForegroundColor Gray
Write-Host "docker-compose logs -f db         # Database logları" -ForegroundColor Gray
Write-Host "docker-compose down               # Container'ları durdur" -ForegroundColor Gray
Write-Host "docker-compose restart api        # API'yi yeniden başlat" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Local Docker test tamamlandı!" -ForegroundColor Green

# TypeScript hatalarını tek tek düzelt
# Bu yaklaşık 20-30 dakika sürer 