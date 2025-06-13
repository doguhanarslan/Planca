# Planca Container Build & Deploy Script
param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$PostgresPassword,
    
    [string]$JwtSecretKey = "your-secure-jwt-secret-key-must-be-at-least-32-characters-long-for-production-use"
)

$registryName = $ResourceGroupName.ToLower() + "registry"
$postgresServerName = $ResourceGroupName.ToLower() + "-postgres"
$containerEnvName = $ResourceGroupName.ToLower() + "-env"

Write-Host "🔨 Container build ve deployment başlatılıyor..." -ForegroundColor Green

# Container Registry'ye giriş
Write-Host "Azure Container Registry'ye giriş yapılıyor..."
az acr login --name $registryName

# API Docker image build ve push
Write-Host "API Docker image build ediliyor..."
docker build -f Planca.API/Dockerfile -t "$registryName.azurecr.io/planca-api:latest" --build-arg BUILD_CONFIGURATION=Release .

Write-Host "API image Azure Container Registry'ye push ediliyor..."
docker push "$registryName.azurecr.io/planca-api:latest"

# Frontend Docker image build ve push (optimized)
Write-Host "Frontend Docker image build ediliyor..."
$apiUrl = "https://planca-api.azurecontainerapps.io/api"
docker build -f planca-client/Dockerfile -t "$registryName.azurecr.io/planca-frontend:latest" --build-arg VITE_API_URL=$apiUrl ./planca-client

Write-Host "Frontend image Azure Container Registry'ye push ediliyor..."
docker push "$registryName.azurecr.io/planca-frontend:latest"

# Connection string hazırlama
$connectionString = "Host=$postgresServerName.postgres.database.azure.com;Database=planca;Username=plancaadmin;Password=$PostgresPassword;SSL Mode=Require;"

# API Container App oluşturma
Write-Host "API Container App oluşturuluyor..."
az containerapp create `
    --name "planca-api" `
    --resource-group $ResourceGroupName `
    --environment $containerEnvName `
    --image "$registryName.azurecr.io/planca-api:latest" `
    --target-port 8080 `
    --ingress external `
    --registry-server "$registryName.azurecr.io" `
    --env-vars "ConnectionStrings__DefaultConnection=$connectionString" "JwtSettings__Key=$JwtSecretKey" "JwtSettings__Issuer=planca-api" "JwtSettings__Audience=planca-clients" "JwtSettings__DurationInMinutes=60" "ASPNETCORE_ENVIRONMENT=Production" `
    --cpu 0.5 --memory 1Gi `
    --min-replicas 1 --max-replicas 3

# Önce API URL'ini al
$apiUrl = az containerapp show --name "planca-api" --resource-group $ResourceGroupName --query "properties.configuration.ingress.fqdn" --output tsv
$actualApiUrl = "https://$apiUrl/api"

# Frontend Container App oluşturma (gerçek API URL ile)
Write-Host "Frontend Container App oluşturuluyor..."
az containerapp create `
    --name "planca-frontend" `
    --resource-group $ResourceGroupName `
    --environment $containerEnvName `
    --image "$registryName.azurecr.io/planca-frontend:latest" `
    --target-port 80 `
    --ingress external `
    --registry-server "$registryName.azurecr.io" `
    --env-vars "VITE_API_URL=$actualApiUrl" `
    --cpu 0.25 --memory 0.5Gi `
    --min-replicas 1 --max-replicas 2

# Final URL'leri al
$frontendUrl = az containerapp show --name "planca-frontend" --resource-group $ResourceGroupName --query "properties.configuration.ingress.fqdn" --output tsv

Write-Host ""
Write-Host "🎉 Deployment tamamlandı!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🔗 API URL: https://$apiUrl" -ForegroundColor Yellow
Write-Host "🌐 Frontend URL: https://$frontendUrl" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Sonraki Adımlar:" -ForegroundColor Cyan
Write-Host "1. Database migration'ları çalıştırın" -ForegroundColor White
Write-Host "2. Health check'leri test edin: https://$apiUrl/health" -ForegroundColor White
Write-Host "3. Frontend'i test edin: https://$frontendUrl" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Debug İçin:" -ForegroundColor Magenta
Write-Host "az containerapp logs show --name planca-api --resource-group $ResourceGroupName --follow" -ForegroundColor Gray
Write-Host "az containerapp logs show --name planca-frontend --resource-group $ResourceGroupName --follow" -ForegroundColor Gray 