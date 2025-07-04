#!/bin/bash

# 🎯 Planca API - Enhanced One-Click Demo Setup
# Bu script tek komutla demo deployment yapar

set -e

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Planca API Demo - Enhanced One-Click Setup${NC}"
echo "====================================="
echo ""
echo -e "Bu script aşağıdakileri yapacak:"
echo -e "${GREEN}✅ Azure kaynaklarını oluştur${NC}"
echo -e "${GREEN}✅ Uygulamayı build et ve deploy et${NC}"
echo -e "${GREEN}✅ Test verilerini oluştur${NC}"
echo -e "${GREEN}✅ Demo bilgilerini göster${NC}"
echo ""

# Onay al
read -p "Devam etmek istiyor musunuz? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}İptal edildi.${NC}"
    exit 1
fi

# Ana değişkenler
RESOURCE_GROUP="rg-planca-demo-$(date +%m%d%H%M)"
LOCATION="North Europe"
DB_SERVER_NAME="planca-demo-db-$(date +%m%d%H%M)"
WEB_APP_NAME="planca-demo-api-$(date +%m%d%H%M)"
REDIS_NAME="planca-demo-redis-$(date +%m%d%H%M)"
DB_ADMIN_USER="plancaadmin"
DB_ADMIN_PASSWORD="DemoPlanca123!@#"
APP_SERVICE_PLAN="asp-planca-demo"

echo ""
echo -e "${BLUE}🔧 Kullanılacak değerler:${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "Database: $DB_SERVER_NAME"
echo "Web App: $WEB_APP_NAME"
echo "Redis: $REDIS_NAME"
echo "Region: $LOCATION"
echo ""

# Ön kontroller
check_prerequisites() {
    echo -e "${BLUE}🔍 Ön kontroller yapılıyor...${NC}"
    
    if ! command -v az &> /dev/null; then
        echo -e "${RED}❌ Azure CLI gerekli. 'winget install Microsoft.AzureCLI' ile yükleyin.${NC}"
        exit 1
    fi
    
    if ! command -v dotnet &> /dev/null; then
        echo -e "${RED}❌ .NET SDK gerekli. .NET 9 SDK'yı yükleyin.${NC}"
        exit 1
    fi
    
    if ! az account show &> /dev/null; then
        echo -e "${RED}❌ Azure'a giriş yapın: az login${NC}"
        exit 1
    fi
    
    # .NET version check
    DOTNET_VERSION=$(dotnet --version | cut -d. -f1)
    if [ "$DOTNET_VERSION" -lt 8 ]; then
        echo -e "${RED}❌ .NET 8+ gerekli. Mevcut versiyon: $(dotnet --version)${NC}"
        exit 1
    fi
    
    # Check if project exists
    if [ ! -f "Planca.API/Planca.API.csproj" ]; then
        echo -e "${RED}❌ Planca.API projesi bulunamadı. Script'i proje root dizininde çalıştırın.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Ön kontroller başarılı${NC}"
}

# 1. Azure kaynaklarını oluştur
create_azure_resources() {
    echo -e "${BLUE}☁️ Azure kaynakları oluşturuluyor...${NC}"
    
    # Resource Group
    az group create --name $RESOURCE_GROUP --location "$LOCATION" --output none
    echo -e "${GREEN}✅ Resource Group oluşturuldu${NC}"
    
    # App Service Plan
    az appservice plan create \
        --name $APP_SERVICE_PLAN \
        --resource-group $RESOURCE_GROUP \
        --location "$LOCATION" \
        --sku B1 \
        --is-linux \
        --output none
    echo -e "${GREEN}✅ App Service Plan oluşturuldu${NC}"
    
    # PostgreSQL Flexible Server (güncel sürüm)
    az postgres flexible-server create \
        --resource-group $RESOURCE_GROUP \
        --name $DB_SERVER_NAME \
        --location "$LOCATION" \
        --admin-user $DB_ADMIN_USER \
        --admin-password $DB_ADMIN_PASSWORD \
        --sku-name Standard_B1ms \
        --tier Burstable \
        --version 15 \
        --storage-size 32 \
        --backup-retention 7 \
        --public-access 0.0.0.0 \
        --output none
    echo -e "${GREEN}✅ PostgreSQL Flexible Server oluşturuldu${NC}"
    
    # Database
    az postgres flexible-server db create \
        --resource-group $RESOURCE_GROUP \
        --server-name $DB_SERVER_NAME \
        --database-name planca \
        --output none
    echo -e "${GREEN}✅ Database oluşturuldu${NC}"
    
   
    
    # Web App
    az webapp create \
        --resource-group $RESOURCE_GROUP \
        --plan $APP_SERVICE_PLAN \
        --name $WEB_APP_NAME \
        --runtime "DOTNETCORE:9.0" \
        --output none
    echo -e "${GREEN}✅ Web App oluşturuldu${NC}"
    
  
}

# 2. Uygulamayı hazırla
prepare_application() {
    echo -e "${BLUE}📦 Uygulama hazırlanıyor...${NC}"
    

    
    # appsettings.Production.json oluştur
    cat > Planca.API/appsettings.Production.json << EOF
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=$DB_SERVER_NAME.postgres.database.azure.com;Database=planca;Username=$DB_ADMIN_USER;Password=$DB_ADMIN_PASSWORD;SSL Mode=Require;Trust Server Certificate=true;"
  },
  "CacheSettings": {
    "ConnectionString": "",
    "InstanceName": "PlancaDemo_",
    "DefaultExpirationMinutes": 30,
    "EnableDistributedCache": true,
    "EnableResponseCaching": true
  },
  "JwtSettings": {
    "Key": "demo-secret-key-for-planca-that-is-long-enough-for-jwt-requirements-256-bits-secure",
    "EncryptedKey": "demo1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "Issuer": "PlancaDemoAPI",
    "Audience": "PlancaDemoClient",
    "DurationInMinutes": 60,
    "RefreshTokenDurationInDays": 7
  },
  "Cors": {
    "Origins": ["https://$WEB_APP_NAME.azurewebsites.net", "http://localhost:3000", "http://localhost:5173"]
  },
  "DataRetention": {
    "PurgeAfter": "30.00:00:00",
    "ArchiveAfter": "15.00:00:00",
    "AutoPurgeEnabled": false,
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
    echo -e "${GREEN}✅ Production konfigürasyon dosyası oluşturuldu${NC}"
    
    # Clean ve restore
    dotnet clean > /dev/null 2>&1
    dotnet restore > /dev/null 2>&1
    echo -e "${GREEN}✅ Dependencies restore edildi${NC}"
    
    # Build
    dotnet build --configuration Release --no-restore > /dev/null 2>&1
    echo -e "${GREEN}✅ Uygulama build edildi${NC}"
    
    # Publish
    dotnet publish Planca.API/Planca.API.csproj \
        --configuration Release \
        --output ./publish \
        --no-build \
        --self-contained false > /dev/null 2>&1
    echo -e "${GREEN}✅ Uygulama publish edildi${NC}"
}

# 3. Azure'a deploy et
deploy_application() {
    echo -e "${BLUE}🚀 Azure'a deploy ediliyor...${NC}"
    
    # App settings
    az webapp config appsettings set \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --settings \
            "ASPNETCORE_ENVIRONMENT=Production" \
            "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false" \
        --output none
    echo -e "${GREEN}✅ App settings ayarlandı${NC}"
    
    # Deploy
    cd publish
    zip -r ../demo-deployment.zip . > /dev/null 2>&1
    cd ..
    
    az webapp deployment source config-zip \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --src demo-deployment.zip \
        --timeout 600 \
        --output none
    echo -e "${GREEN}✅ Uygulama deploy edildi${NC}"
    
    # Always On ayarla (B1 plan için)
    az webapp config set \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --always-on true \
        --output none
    echo -e "${GREEN}✅ Always On aktifleştirildi${NC}"
    
    # Restart
    az webapp restart --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME --output none
    echo -e "${GREEN}✅ Uygulama yeniden başlatıldı${NC}"
}

# 4. Test et
test_deployment() {
    echo -e "${BLUE}🧪 Deployment test ediliyor...${NC}"
    
    APP_URL="https://$WEB_APP_NAME.azurewebsites.net"
    
    # Startup bekleme süresi
    echo -e "${YELLOW}⏱️ Uygulamanın başlaması bekleniyor (60 saniye)...${NC}"
    sleep 60
    
    # Health check
    echo -e "${BLUE}🔍 Health check yapılıyor...${NC}"
    for i in {1..15}; do
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/health" || echo "000")
        if [ "$HTTP_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ Health check başarılı! (HTTP $HTTP_STATUS)${NC}"
            break
        else
            if [ $i -eq 15 ]; then
                echo -e "${RED}❌ Health check başarısız! (HTTP $HTTP_STATUS)${NC}"
                echo "URL: $APP_URL/health"
                echo -e "${YELLOW}Azure Portal'dan logs kontrol edin:${NC}"
                echo "az webapp log tail --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME"
                return 1
            fi
            echo -e "${YELLOW}⏳ Deneme $i/15 (HTTP $HTTP_STATUS), tekrar deneniyor...${NC}"
            sleep 10
        fi
    done
}

# 5. Demo verilerini oluştur
create_demo_data() {
    echo -e "${BLUE}📊 Demo verileri oluşturuluyor...${NC}"
    
    APP_URL="https://$WEB_APP_NAME.azurewebsites.net"
    API_URL="$APP_URL/api"
    
    # Kullanıcı kaydı
    echo -e "${BLUE}👤 Demo kullanıcısı kaydediliyor...${NC}"
    USER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "demo@planca.com",
            "password": "Demo123!",
            "firstName": "Demo",
            "lastName": "User",
            "userName": "demouser"
        }')
    
    if [[ $USER_RESPONSE == *"userId"* ]]; then
        echo -e "${GREEN}✅ Demo kullanıcısı oluşturuldu${NC}"
    else
        echo -e "${YELLOW}⚠️ Kullanıcı zaten mevcut olabilir${NC}"
    fi
    
    # Login
    echo -e "${BLUE}🔐 Demo kullanıcısı giriş yapıyor...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -c demo-cookies.txt \
        -d '{
            "email": "demo@planca.com",
            "password": "Demo123!"
        }')
    
    if [[ $LOGIN_RESPONSE == *"userId"* ]]; then
        echo -e "${GREEN}✅ Demo kullanıcısı giriş yaptı${NC}"
        
        # İşletme oluştur
        echo -e "${BLUE}🏢 Demo işletmesi oluşturuluyor...${NC}"
        BUSINESS_RESPONSE=$(curl -s -X POST "$API_URL/auth/create-business" \
            -H "Content-Type: application/json" \
            -b demo-cookies.txt \
            -d '{
                "name": "Demo Kuaför Salonu",
                "subdomain": "demo-salon",
                "primaryColor": "#FF6B6B",
                "address": "Demo Mahallesi, Demo Sokak No:1",
                "city": "İstanbul",
                "state": "İstanbul",
                "zipCode": "34000",
                "workingHours": [
                    {"day": 1, "openTimeString": "09:00", "closeTimeString": "18:00"},
                    {"day": 2, "openTimeString": "09:00", "closeTimeString": "18:00"},
                    {"day": 3, "openTimeString": "09:00", "closeTimeString": "18:00"},
                    {"day": 4, "openTimeString": "09:00", "closeTimeString": "18:00"},
                    {"day": 5, "openTimeString": "09:00", "closeTimeString": "18:00"},
                    {"day": 6, "openTimeString": "10:00", "closeTimeString": "16:00"}
                ]
            }')
        
        if [[ $BUSINESS_RESPONSE == *"businessId"* ]]; then
            TENANT_ID=$(echo $BUSINESS_RESPONSE | grep -o '"businessId":"[^"]*' | cut -d'"' -f4)
            echo -e "${GREEN}✅ Demo işletmesi oluşturuldu (ID: $TENANT_ID)${NC}"
            
            # Hizmetler ekle
            echo -e "${BLUE}💇 Demo hizmetleri ekleniyor...${NC}"
            
            # Hizmet 1: Saç Kesimi
            curl -s -X POST "$API_URL/services" \
                -H "Content-Type: application/json" \
                -H "X-TenantId: $TENANT_ID" \
                -b demo-cookies.txt \
                -d '{
                    "name": "Saç Kesimi",
                    "description": "Profesyonel saç kesimi ve şekillendirme",
                    "price": 150.00,
                    "durationMinutes": 45,
                    "color": "#4ECDC4",
                    "isActive": true
                }' > /dev/null
            
            # Hizmet 2: Saç Boyama
            curl -s -X POST "$API_URL/services" \
                -H "Content-Type: application/json" \
                -H "X-TenantId: $TENANT_ID" \
                -b demo-cookies.txt \
                -d '{
                    "name": "Saç Boyama",
                    "description": "Tam kafa saç boyama işlemi",
                    "price": 350.00,
                    "durationMinutes": 120,
                    "color": "#FF6B6B",
                    "isActive": true
                }' > /dev/null
            
            # Hizmet 3: Manikür
            curl -s -X POST "$API_URL/services" \
                -H "Content-Type: application/json" \
                -H "X-TenantId: $TENANT_ID" \
                -b demo-cookies.txt \
                -d '{
                    "name": "Manikür",
                    "description": "Profesyonel manikür ve tırnak bakımı",
                    "price": 100.00,
                    "durationMinutes": 60,
                    "color": "#45B7D1",
                    "isActive": true
                }' > /dev/null
            
            echo -e "${GREEN}✅ Demo hizmetleri eklendi${NC}"
            
        else
            echo -e "${YELLOW}⚠️ İşletme oluşturulamadı veya zaten mevcut${NC}"
            echo "Response: $BUSINESS_RESPONSE"
        fi
    else
        echo -e "${RED}❌ Demo kullanıcısı giriş yapamadı${NC}"
        echo "Response: $LOGIN_RESPONSE"
    fi
    
    rm -f demo-cookies.txt
}

# 6. Cleanup
cleanup() {
    echo -e "${BLUE}🧹 Geçici dosyalar temizleniyor...${NC}"
    rm -f demo-deployment.zip
    rm -rf publish
    rm -f Planca.API/appsettings.Production.json
    rm -f demo-cookies.txt
}

# 7. Sonuçları göster
show_results() {
    echo ""
    echo -e "${GREEN}🎉 DEMO SETUP TAMAMLANDI!${NC}"
    echo "========================"
    echo ""
    echo -e "${BLUE}🌐 Demo URL:${NC} https://$WEB_APP_NAME.azurewebsites.net"
    echo -e "${BLUE}🏥 Health Check:${NC} https://$WEB_APP_NAME.azurewebsites.net/health"
    echo -e "${BLUE}📚 API Docs:${NC} https://$WEB_APP_NAME.azurewebsites.net/swagger"
    echo ""
    echo -e "${YELLOW}👤 Demo Giriş Bilgileri:${NC}"
    echo "   Email: demo@planca.com"
    echo "   Password: Demo123!"
    echo ""
    echo -e "${YELLOW}🏢 Demo İşletme:${NC} Demo Kuaför Salonu"
    echo -e "${YELLOW}💇 Demo Hizmetler:${NC} Saç Kesimi, Saç Boyama, Manikür"
    echo ""
    echo -e "${BLUE}🔧 Test Komutları:${NC}"
    echo "   curl https://$WEB_APP_NAME.azurewebsites.net/health"
    echo "   curl https://$WEB_APP_NAME.azurewebsites.net/api/auth/register"
    echo ""
    echo -e "${BLUE}📊 Azure Resources:${NC}"
    echo "   Resource Group: $RESOURCE_GROUP"
    echo "   PostgreSQL: $DB_SERVER_NAME"
    echo "   Redis Cache: $REDIS_NAME"
    echo "   Web App: $WEB_APP_NAME"
    echo ""
    echo -e "${YELLOW}💰 Tahmini Aylık Maliyet: ~\$15-25${NC}"
    echo ""
    echo -e "${RED}🗑️ Kaynakları silmek için:${NC}"
    echo "   az group delete --name $RESOURCE_GROUP --yes --no-wait"
    echo ""
    echo -e "${GREEN}📖 Demo başarıyla kuruldu! Yukarıdaki URL'lerden test edebilirsiniz.${NC}"
    echo ""
}

# Error handling
trap 'echo -e "${RED}❌ Kurulum başarısız!${NC}"; cleanup; exit 1' ERR

# Ana akış
main() {
    check_prerequisites
    echo ""
    create_azure_resources
    echo ""
    prepare_application
    echo ""
    deploy_application
    echo ""
    test_deployment
    echo ""
    create_demo_data
    echo ""
    cleanup
    show_results
}

# Çalıştır
main