#!/bin/bash

# 🎯 Planca API - Application Deployment
# Bu script uygulamayı hazırlar ve Azure'a deploy eder

set -e

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Planca API - Application Deployment${NC}"
echo "======================================"
echo ""

# Environment dosyasını yükle
load_environment() {
    if [ -f ".env.azure" ]; then
        echo -e "${BLUE}📁 Azure konfigürasyonu yükleniyor...${NC}"
        source .env.azure
        echo -e "${GREEN}✅ Konfigürasyon yüklendi${NC}"
    else
        echo -e "${RED}❌ .env.azure dosyası bulunamadı!${NC}"
        echo "Önce ./demo-azure-setup.sh scriptini çalıştırın."
        exit 1
    fi
}

# Ön kontroller
check_prerequisites() {
    echo -e "${BLUE}🔍 Ön kontroller...${NC}"
    
    if ! command -v az &> /dev/null; then
        echo -e "${RED}❌ Azure CLI gerekli.${NC}"
        exit 1
    fi
    
    if ! command -v dotnet &> /dev/null; then
        echo -e "${RED}❌ .NET SDK gerekli.${NC}"
        exit 1
    fi
    
    if ! az account show &> /dev/null; then
        echo -e "${RED}❌ Azure'a giriş yapın: az login${NC}"
        exit 1
    fi
    
    # .NET version check
    DOTNET_VERSION=$(dotnet --version | cut -d. -f1)
    if [ "$DOTNET_VERSION" -lt 8 ]; then
        echo -e "${RED}❌ .NET 8+ gerekli. Mevcut: $(dotnet --version)${NC}"
        exit 1
    fi
    
    # Proje kontrolü
    if [ ! -f "Planca.API/Planca.API.csproj" ]; then
        echo -e "${RED}❌ Planca.API projesi bulunamadı.${NC}"
        exit 1
    fi
    
    # Environment variables kontrolü
    if [ -z "$RESOURCE_GROUP" ] || [ -z "$WEB_APP_NAME" ]; then
        echo -e "${RED}❌ Gerekli environment variables eksik!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Ön kontroller başarılı${NC}"
    echo "• Resource Group: $RESOURCE_GROUP"
    echo "• Web App: $WEB_APP_NAME"
    echo "• Database: $DB_SERVER_NAME"
}

# Production konfigürasyonu oluştur
create_production_config() {
    echo -e "${BLUE}⚙️ Production konfigürasyonu oluşturuluyor...${NC}"
    
    # Redis key'i al (eğer yoksa)
    if [ -z "$REDIS_CONNECTION_STRING" ]; then
        echo -e "${YELLOW}⏳ Redis connection string alınıyor...${NC}"
        REDIS_KEY=$(az redis list-keys --resource-group $RESOURCE_GROUP --name $REDIS_NAME --query primaryKey --output tsv)
        REDIS_CONNECTION_STRING="$REDIS_NAME.redis.cache.windows.net:6380,password=$REDIS_KEY,ssl=True,abortConnect=False"
    fi
    
    # JWT secrets oluştur (production için güvenli)
    JWT_SECRET="planca-prod-$(openssl rand -hex 32)"
    JWT_ENCRYPTION_KEY=$(openssl rand -hex 32)
    
    # appsettings.Production.json oluştur
    cat > Planca.API/appsettings.Production.json << EOF
{
  "ConnectionStrings": {
    "DefaultConnection": "$DB_CONNECTION_STRING"
  },
  "CacheSettings": {
    "ConnectionString": "$REDIS_CONNECTION_STRING",
    "InstanceName": "PlancaProd_",
    "DefaultExpirationMinutes": 30,
    "EnableDistributedCache": true,
    "EnableResponseCaching": true
  },
  "JwtSettings": {
    "Key": "$JWT_SECRET",
    "EncryptedKey": "$JWT_ENCRYPTION_KEY",
    "Issuer": "PlancaProductionAPI",
    "Audience": "PlancaProductionClient",
    "DurationInMinutes": 60,
    "RefreshTokenDurationInDays": 7
  },
  "Cors": {
    "Origins": [
      "$APP_URL",
      "https://*.azurewebsites.net",
      "http://localhost:3000",
      "http://localhost:5173"
    ]
  },
  "DataRetention": {
    "PurgeAfter": "30.00:00:00",
    "ArchiveAfter": "15.00:00:00",
    "AutoPurgeEnabled": true,
    "PurgeIntervalMinutes": 1440
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
EOF

    # Application Insights varsa ekle
    if [ ! -z "$APPINSIGHTS_CONNECTION_STRING" ]; then
        echo -e "${BLUE}📊 Application Insights konfigürasyonu ekleniyor...${NC}"
        
        # Geçici dosya ile JSON güncelle
        jq --arg conn "$APPINSIGHTS_CONNECTION_STRING" '. + {"ApplicationInsights": {"ConnectionString": $conn}}' \
            Planca.API/appsettings.Production.json > temp.json && \
            mv temp.json Planca.API/appsettings.Production.json
    fi
    
    echo -e "${GREEN}✅ Production konfigürasyonu oluşturuldu${NC}"
}

# Uygulamayı build et
build_application() {
    echo -e "${BLUE}🔨 Uygulama build ediliyor...${NC}"
    
    # Clean
    dotnet clean > /dev/null 2>&1
    echo -e "${GREEN}✅ Clean tamamlandı${NC}"
    
    # Restore
    dotnet restore > /dev/null 2>&1
    echo -e "${GREEN}✅ Restore tamamlandı${NC}"
    
    # Build
    dotnet build --configuration Release --no-restore > /dev/null 2>&1
    echo -e "${GREEN}✅ Build tamamlandı${NC}"
    
    # Test (varsa)
    if [ -d "Planca.Tests" ] || ls *.Tests* 1> /dev/null 2>&1; then
        echo -e "${BLUE}🧪 Testler çalıştırılıyor...${NC}"
        dotnet test --configuration Release --no-build --verbosity quiet
        echo -e "${GREEN}✅ Testler başarılı${NC}"
    fi
    
    # Publish
    echo -e "${BLUE}📦 Publish işlemi...${NC}"
    dotnet publish Planca.API/Planca.API.csproj \
        --configuration Release \
        --output ./publish \
        --no-build \
        --self-contained false \
        --verbosity quiet
    echo -e "${GREEN}✅ Publish tamamlandı${NC}"
}

# Azure App Settings güncellemeler
update_app_settings() {
    echo -e "${BLUE}⚙️ Azure App Settings güncelleniyor...${NC}"
    
    # Temel ayarlar
    az webapp config appsettings set \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --settings \
            "ASPNETCORE_ENVIRONMENT=Production" \
            "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false" \
            "WEBSITE_TIME_ZONE=Turkey Standard Time" \
            "WEBSITE_RUN_FROM_PACKAGE=1" \
        --output none
    
    # Application Insights varsa ekle
    if [ ! -z "$APPINSIGHTS_CONNECTION_STRING" ]; then
        az webapp config appsettings set \
            --resource-group $RESOURCE_GROUP \
            --name $WEB_APP_NAME \
            --settings \
                "APPLICATIONINSIGHTS_CONNECTION_STRING=$APPINSIGHTS_CONNECTION_STRING" \
            --output none
        echo -e "${GREEN}✅ Application Insights ayarlandı${NC}"
    fi
    
    echo -e "${GREEN}✅ App Settings güncellendi${NC}"
}

# Deployment paketi hazırla
prepare_deployment_package() {
    echo -e "${BLUE}📦 Deployment paketi hazırlanıyor...${NC}"
    
    # Publish klasörüne gir ve zip oluştur
    cd publish
    
    # Unnecessary files'ı temizle
    find . -name "*.pdb" -delete
    find . -name "*.xml" -delete 2>/dev/null || true
    
    # Zip oluştur
    zip -r ../deployment-package.zip . > /dev/null 2>&1
    cd ..
    
    # Zip boyutunu kontrol et
    PACKAGE_SIZE=$(du -sh deployment-package.zip | cut -f1)
    echo -e "${GREEN}✅ Deployment paketi hazır (boyut: $PACKAGE_SIZE)${NC}"
}

# Azure'a deploy et
deploy_to_azure() {
    echo -e "${BLUE}🚀 Azure'a deploy ediliyor...${NC}"
    
    # Stop app (opcional)
    echo -e "${YELLOW}⏸️ Uygulama durduruluyor...${NC}"
    az webapp stop --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME --output none
    
    # Deploy
    az webapp deployment source config-zip \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --src deployment-package.zip \
        --timeout 600 \
        --output none
    
    echo -e "${GREEN}✅ Deployment tamamlandı${NC}"
    
    # Start app
    echo -e "${BLUE}▶️ Uygulama başlatılıyor...${NC}"
    az webapp start --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME --output none
    
    echo -e "${GREEN}✅ Uygulama başlatıldı${NC}"
}

# Health check
verify_deployment() {
    echo -e "${BLUE}🏥 Deployment doğrulanıyor...${NC}"
    
    # Startup süresi ver
    echo -e "${YELLOW}⏱️ Uygulamanın başlaması bekleniyor (60 saniye)...${NC}"
    sleep 60
    
    # Health check endpoint'i test et
    for i in {1..10}; do
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/health" || echo "000")
        
        if [ "$HTTP_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ Health check başarılı! (HTTP $HTTP_STATUS)${NC}"
            
            # API endpoint'lerini test et
            test_api_endpoints
            return 0
        else
            if [ $i -eq 10 ]; then
                echo -e "${RED}❌ Health check başarısız! (HTTP $HTTP_STATUS)${NC}"
                echo -e "${YELLOW}Logs kontrol edin:${NC}"
                echo "az webapp log tail --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME"
                return 1
            fi
            echo -e "${YELLOW}⏳ Deneme $i/10 (HTTP $HTTP_STATUS), tekrar deneniyor...${NC}"
            sleep 15
        fi
    done
}

# API endpoints test
test_api_endpoints() {
    echo -e "${BLUE}🔍 API endpoints test ediliyor...${NC}"
    
    # Swagger endpoint
    SWAGGER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/swagger" || echo "000")
    if [ "$SWAGGER_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Swagger UI erişilebilir${NC}"
    else
        echo -e "${YELLOW}⚠️ Swagger UI erişilemedi (HTTP $SWAGGER_STATUS)${NC}"
    fi
    
    # Register endpoint
    REGISTER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$APP_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"test": "true"}' || echo "000")
    
    if [ "$REGISTER_STATUS" = "400" ] || [ "$REGISTER_STATUS" = "422" ]; then
        echo -e "${GREEN}✅ Register endpoint erişilebilir (validation error beklenen)${NC}"
    else
        echo -e "${YELLOW}⚠️ Register endpoint beklenmeyen response (HTTP $REGISTER_STATUS)${NC}"
    fi
}

# Cleanup
cleanup() {
    echo -e "${BLUE}🧹 Geçici dosyalar temizleniyor...${NC}"
    rm -f deployment-package.zip
    rm -rf publish
    rm -f Planca.API/appsettings.Production.json
    echo -e "${GREEN}✅ Cleanup tamamlandı${NC}"
}

# Sonuçları göster
show_deployment_results() {
    echo ""
    echo -e "${GREEN}🎉 DEPLOYMENT TAMAMLANDI!${NC}"
    echo "=========================="
    echo ""
    echo -e "${BLUE}🌐 Application URL:${NC} $APP_URL"
    echo -e "${BLUE}🏥 Health Check:${NC} $APP_URL/health"
    echo -e "${BLUE}📚 API Documentation:${NC} $APP_URL/swagger"
    echo ""
    echo -e "${BLUE}🔧 Useful Commands:${NC}"
    echo "• Health check: curl $APP_URL/health"
    echo "• View logs: az webapp log tail --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME"
    echo "• Restart app: az webapp restart --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME"
    echo ""
    echo -e "${BLUE}📊 Monitoring:${NC}"
    if [ ! -z "$APPINSIGHTS_CONNECTION_STRING" ]; then
        echo "• Application Insights aktif"
        echo "• Azure Portal > Monitor > Application Insights"
    else
        echo "• Application Insights aktif değil"
    fi
    echo ""
    echo -e "${YELLOW}📋 Sonraki Adımlar:${NC}"
    echo "1. $APP_URL adresini ziyaret edin"
    echo "2. ./demo-seed-data.sh ile test verilerini oluşturun"
    echo "3. API'yi test edin"
    echo ""
}

# Error handling
trap 'echo -e "${RED}❌ Deployment başarısız!${NC}"; cleanup; exit 1' ERR

# Ana akış
main() {
    load_environment
    echo ""
    check_prerequisites
    echo ""
    create_production_config
    echo ""
    build_application
    echo ""
    prepare_deployment_package
    echo ""
    update_app_settings
    echo ""
    deploy_to_azure
    echo ""
    verify_deployment
    echo ""
    cleanup
    show_deployment_results
}

# Script parametreleri
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-health-check)
            SKIP_HEALTH_CHECK=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --skip-tests          Skip running tests"
            echo "  --skip-health-check   Skip health check after deployment"
            echo "  --help               Show this help"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Çalıştır
main