# Planca Azure Deployment Rehberi

Bu rehber, Planca uygulamanızı Microsoft Azure'a nasıl deploy edeceğinizi adım adım açıklamaktadır.

## 🛠️ Gereksinimler

1. **Azure CLI** yüklenmiş olmalı ([İndirme linki](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
2. **Docker Desktop** yüklenmiş ve çalışır durumda olmalı
3. **Node.js** yüklenmiş olmalı (Frontend build için)
4. **Aktif Azure Subscription**

## 🚀 Hızlı Deployment

### 1. Azure CLI Kurulumu ve Giriş

```powershell
# Azure CLI'yi yükledikten sonra
az login

# Subscription'ınızı listeleyin
az account list --output table

# Kullanmak istediğiniz subscription'ı seçin
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 2. Azure Kaynaklarını Oluşturun

```powershell
# Script'i çalıştırın (PowerShell Admin olarak)
.\deploy-azure.ps1 -ResourceGroupName "planca-rg" -SubscriptionId "YOUR_SUBSCRIPTION_ID" -PostgresAdminPassword "YourStrongPassword123!"
```

### 3. Container'ları Build ve Deploy Edin

```powershell
# Ikinci script'i çalıştırın
.\deploy-containers.ps1 -ResourceGroupName "planca-rg" -PostgresPassword "YourStrongPassword123!"
```

## 📋 Detaylı Adımlar

### 1. Azure Kaynakları

Script aşağıdaki kaynakları oluşturacak:

- **Resource Group**: Tüm kaynakları gruplayacak
- **Azure Container Registry**: Docker image'larınızı saklayacak
- **PostgreSQL Flexible Server**: Veritabanı sunucusu
- **Container Apps Environment**: Container'larınızı çalıştıracak ortam

### 2. Container Build Süreci

#### API Container
- .NET 9.0 API Dockerfile kullanılarak build edilir
- Azure Container Registry'ye push edilir
- Container App olarak deploy edilir

#### Frontend Container
- React/Vite uygulaması build edilir
- Nginx ile serve edilir
- API proxy konfigürasyonu eklenir

### 3. Environment Variables

API Container'ı şu environment variable'ları kullanır:

```
ConnectionStrings__DefaultConnection: PostgreSQL bağlantı string'i
JwtSettings__Key: JWT secret key
JwtSettings__Issuer: planca-api
JwtSettings__Audience: planca-clients
JwtSettings__DurationInMinutes: 60
```

## 🔐 Güvenlik Konfigürasyonları

### PostgreSQL
- Flexible Server kullanılır
- SSL zorunlu
- Firewall kuralları otomatik ayarlanır

### JWT Secret
- Production'da mutlaka güvenli bir key kullanın
- En az 32 karakter uzunluğunda olmalı

## 🌐 Erişim

Deployment tamamlandıktan sonra:

```
API URL: https://planca-api.{unique-identifier}.westeurope.azurecontainerapps.io
Frontend URL: https://planca-frontend.{unique-identifier}.westeurope.azurecontainerapps.io
```

## 🔄 Database Migration

İlk deployment'tan sonra database migration'ları çalıştırmanız gerekebilir:

```powershell
# Container içinde migration çalıştırmak için
az containerapp exec --name planca-api --resource-group planca-rg --command "dotnet ef database update"
```

## 📊 Monitoring ve Logs

### Log'ları Görüntüleme

```powershell
# API logs
az containerapp logs show --name planca-api --resource-group planca-rg --follow

# Frontend logs
az containerapp logs show --name planca-frontend --resource-group planca-rg --follow
```

### Scaling

```powershell
# Manual scaling
az containerapp update --name planca-api --resource-group planca-rg --min-replicas 2 --max-replicas 5
```

## 🆕 Update Deployment

Yeni bir versiyonu deploy etmek için:

```powershell
# Yeni image'ı build edin
docker build -f Planca.API/Dockerfile -t plancargregistry.azurecr.io/planca-api:v2 .

# Registry'ye push edin
docker push plancargregistry.azurecr.io/planca-api:v2

# Container App'i güncelleyin
az containerapp update --name planca-api --resource-group planca-rg --image plancargregistry.azurecr.io/planca-api:v2
```

## 💰 Maliyet Optimizasyonu

### Development/Test Ortamı İçin

- Container Apps: Minimum resource (0.25 CPU, 0.5 Gi memory)
- PostgreSQL: Burstable tier (Standard_B1ms)
- Container Registry: Basic tier

### Production Ortamı İçin

- Container Apps: Daha yüksek resource ve replica sayısı
- PostgreSQL: General Purpose tier
- Container Registry: Standard tier
- Application Insights eklenmesi önerilir

## 🚨 Troubleshooting

### Yaygın Sorunlar

1. **Docker build hatası**: 
   - Docker Desktop'ın çalıştığından emin olun
   - Dockerfile yolunu kontrol edin

2. **Azure CLI authentication hatası**:
   - `az login` komutunu tekrar çalıştırın
   - Subscription'ınızın aktif olduğunu kontrol edin

3. **PostgreSQL bağlantı hatası**:
   - Firewall kurallarını kontrol edin
   - Connection string'in doğru olduğunu kontrol edin

4. **Container App başlamıyor**:
   - Log'ları kontrol edin: `az containerapp logs show`
   - Environment variable'ları kontrol edin

### Debug Commands

```powershell
# Container durumunu kontrol et
az containerapp show --name planca-api --resource-group planca-rg

# Replica durumunu kontrol et
az containerapp replica list --name planca-api --resource-group planca-rg

# Environment variable'ları kontrol et
az containerapp show --name planca-api --resource-group planca-rg --query "properties.template.containers[0].env"
```

## 🔗 Faydalı Linkler

- [Azure Container Apps Documentation](https://docs.microsoft.com/en-us/azure/container-apps/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## 🎯 Sonraki Adımlar

1. **Custom Domain**: Kendi domain'inizi bağlayın
2. **SSL Certificate**: Let's Encrypt veya kendi sertifikanızı kullanın
3. **CI/CD Pipeline**: GitHub Actions ile otomatik deployment
4. **Monitoring**: Application Insights entegre edin
5. **Backup**: PostgreSQL backup stratejisi oluşturun 