# Azure Container Apps Deployment Script for Planca
# Bu script'i çalıştırmadan önce Azure CLI'yi yükleyin ve giriş yapın

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$true)]
    [string]$Location = "West Europe",
    
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$true)]
    [string]$PostgresAdminPassword
)

Write-Host "🚀 Planca Azure Deployment başlatılıyor..." -ForegroundColor Green

# Azure'a giriş kontrolü
Write-Host "Azure CLI giriş durumu kontrol ediliyor..."
$loginStatus = az account show --query "user.name" --output tsv 2>$null
if (-not $loginStatus) {
    Write-Host "❌ Azure'a giriş yapmanız gerekiyor. 'az login' komutunu çalıştırın." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Azure giriş başarılı: $loginStatus" -ForegroundColor Green

# Subscription seçimi
Write-Host "Subscription ayarlanıyor: $SubscriptionId"
az account set --subscription $SubscriptionId

# Resource Group oluşturma
Write-Host "Resource Group oluşturuluyor: $ResourceGroupName"
az group create --name $ResourceGroupName --location $Location

# Container Registry oluşturma
$registryName = $ResourceGroupName.ToLower() + "registry"
Write-Host "Azure Container Registry oluşturuluyor: $registryName"
az acr create --resource-group $ResourceGroupName --name $registryName --sku Basic --admin-enabled true

# PostgreSQL Flexible Server oluşturma
$postgresServerName = $ResourceGroupName.ToLower() + "-postgres"
Write-Host "PostgreSQL Flexible Server oluşturuluyor: $postgresServerName"
az postgres flexible-server create `
    --resource-group $ResourceGroupName `
    --name $postgresServerName `
    --admin-user plancaadmin `
    --admin-password $PostgresAdminPassword `
    --sku-name Standard_B1ms `
    --tier Burstable `
    --storage-size 32 `
    --version 15 `
    --location $Location `
    --public-access 0.0.0.0

# Veritabanı oluşturma
Write-Host "Planca veritabanı oluşturuluyor..."
az postgres flexible-server db create `
    --resource-group $ResourceGroupName `
    --server-name $postgresServerName `
    --database-name planca

# Container App Environment oluşturma
$containerEnvName = $ResourceGroupName.ToLower() + "-env"
Write-Host "Container Apps Environment oluşturuluyor: $containerEnvName"
az containerapp env create `
    --name $containerEnvName `
    --resource-group $ResourceGroupName `
    --location $Location

Write-Host "🎯 Sonraki adımlar:" -ForegroundColor Yellow
Write-Host "1. Docker image'ları build edin ve registry'ye push edin:" -ForegroundColor White
Write-Host "   docker build -f Planca.API/Dockerfile -t $registryName.azurecr.io/planca-api:latest ." -ForegroundColor Gray
Write-Host "   az acr login --name $registryName" -ForegroundColor Gray
Write-Host "   docker push $registryName.azurecr.io/planca-api:latest" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Container App'i deploy edin:" -ForegroundColor White
Write-Host "   Registry Name: $registryName.azurecr.io" -ForegroundColor Gray
Write-Host "   Postgres Server: $postgresServerName.postgres.database.azure.com" -ForegroundColor Gray
Write-Host "   Environment Name: $containerEnvName" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Azure kaynakları başarıyla oluşturuldu!" -ForegroundColor Green 