# Database connection test for Docker containers
Write-Host "Database Connection Test" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. PostgreSQL Container Check:" -ForegroundColor Yellow
docker ps --filter "name=planca_db" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "2. PostgreSQL Health Check:" -ForegroundColor Yellow
$dbHealthy = docker exec planca_db pg_isready -U postgres -d planca 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database is ready!" -ForegroundColor Green
} else {
    Write-Host "Database is not ready!" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Database Connection Test:" -ForegroundColor Yellow
docker exec planca_db psql -U postgres -d planca -c 'SELECT version();' 2>$null

Write-Host ""
Write-Host "4. API Container Status:" -ForegroundColor Yellow
docker ps --filter "name=planca_api" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "5. API Container Logs:" -ForegroundColor Yellow
docker logs planca_api --tail 10 2>$null

Write-Host ""
Write-Host "6. Network Connectivity Test:" -ForegroundColor Yellow
docker exec planca_api ping -c 2 db 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Network connectivity OK!" -ForegroundColor Green
} else {
    Write-Host "Network connectivity failed!" -ForegroundColor Red
}

Write-Host ""
Write-Host "7. Connection String Test:" -ForegroundColor Yellow
$connectionString = docker exec planca_api env 2>$null | Select-String -Pattern "ConnectionStrings"
if ($connectionString) {
    Write-Host $connectionString -ForegroundColor Green
} else {
    Write-Host "Connection string not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green 