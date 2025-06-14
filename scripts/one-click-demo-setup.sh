#!/bin/bash

# 🎯 Planca API - One-Click Demo Setup
# Bu script tek komutla demo deployment yapar

set -e

echo "🚀 Planca API Demo - One-Click Setup"
echo "====================================="
echo ""
echo "Bu script aşağıdakileri yapacak:"
echo "✅ Azure kaynaklarını oluştur"
echo "✅ Uygulamayı build et ve deploy et"
echo "✅ Test verilerini oluştur"
echo "✅ Demo bilgilerini göster"
echo ""

# Onay al
read -p "Devam etmek istiyor musunuz? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "İptal edildi."
    exit 1
fi

# Ana değişkenler
RESOURCE_GROUP="rg-planca-demo"
LOCATION="West Europe"
DB_SERVER_NAME="planca-demo-db"
WEB_APP_NAME="planca-demo-api"
DB_ADMIN_USER="democuser"
DB_ADMIN_PASSWORD="DemoPlanca123!"

echo ""
echo "🔧 Kullanılacak değerler:"
echo "Resource Group: $RESOURCE_GROUP"
echo "Database: $DB_SERVER_NAME"
echo "Web App: $WEB_APP_NAME"
echo "Region: $LOCATION"
echo ""

# 1. Azure kaynaklarını oluştur
create_azure_resources() {
    echo "☁️ Azure kaynakları oluşturuluyor..."
    
    # Resource Group
    az group create --name $RESOURCE_GROUP --location "$LOCATION" --output none
    echo "✅ Resource Group oluşturuldu"
    
    # PostgreSQL
    az postgres server create \
        --resource-group $RESOURCE_GROUP \
        --name $DB_SERVER_NAME \
        --location "$LOCATION" \
        --admin-user $DB_ADMIN_USER \
        --admin-password $DB_ADMIN_PASSWORD \
        --sku-name B_Gen5_1 \
        --version 11 \
        --storage-size 5120 \
        --backup-retention 7 \
        --geo-redundant-backup Disabled \
        --output none
    echo "✅ PostgreSQL server oluşturuldu"
    
    # Database
    az postgres db create \
        --resource-group $RESOURCE_GROUP \
        --server-name $DB_SERVER_NAME \
        --name planca \
        --output none
    echo "✅ Database oluşturuldu"
    
    # Firewall
    az postgres server firewall-rule create \
        --resource-group $RESOURCE_GROUP \
        --server $DB_SERVER_NAME \
        --name AllowAzureServices \
        --start-ip-address 0.0.0.0 \
        --end-ip-address 0.0.0.0 \
        --output none
    echo "✅ Firewall kuralları oluşturuldu"
    
    # Web App
    az webapp up \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --location "$LOCATION" \
        --sku F1 \
        --runtime "DOTNETCORE:9.0" \
        --output none
    echo "✅ Web App oluşturuldu"
    
    echo "🎉 Azure kaynakları hazır!"
}

# 2. Uygulamayı hazırla
prepare_application() {
    echo "📦 Uygulama hazırlanıyor..."
    
    # appsettings.Demo.json oluştur
    cat > Planca.API/appsettings.Demo.json << EOF
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=$DB_SERVER_NAME.postgres.database.azure.com;Database=planca;Username=$DB_ADMIN_USER@$DB_SERVER_NAME;Password=$DB_ADMIN_PASSWORD;SSL Mode=Require;"
  },
  "CacheSettings": {
    "EnableDistributedCache": false
  },
  "JwtSettings": {
    "Key": "demo-secret-key-for-planca-that-is-long-enough-for-jwt-requirements-256-bits",
    "EncryptedKey": "demo1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "Issuer": "PlancaDemoAPI",
    "Audience": "PlancaDemoClient",
    "DurationInMinutes": 60,
    "RefreshTokenDurationInDays": 7
  },
  "Cors": {
    "Origins": ["*"]
  },
  "DataRetention": {
    "AutoPurgeEnabled": false
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
EOF
    echo "✅ Konfigürasyon dosyası oluşturuldu"
    
    # Build
    dotnet clean > /dev/null 2>&1
    dotnet restore > /dev/null 2>&1
    dotnet build --configuration Release --no-restore > /dev/null 2>&1
    echo "✅ Uygulama build edildi"
    
    # Publish
    cp Planca.API/appsettings.Demo.json Planca.API/appsettings.Production.json
    dotnet publish Planca.API/Planca.API.csproj --configuration Release --output ./publish --no-build > /dev/null 2>&1
    echo "✅ Uygulama publish edildi"
}

# 3. Azure'a deploy et
deploy_application() {
    echo "🚀 Azure'a deploy ediliyor..."
    
    # App settings
    az webapp config appsettings set \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --settings \
            "ASPNETCORE_ENVIRONMENT=Production" \
            "JwtSettings__Key=demo-secret-key-for-planca-that-is-long-enough-for-jwt-requirements-256-bits" \
            "JwtSettings__EncryptedKey=demo1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" \
            "JwtSettings__Issuer=PlancaDemoAPI" \
            "JwtSettings__Audience=PlancaDemoClient" \
            "CacheSettings__EnableDistributedCache=false" \
            "DataRetention__AutoPurgeEnabled=false" \
            "Cors__Origins__0=*" \
        --output none
    echo "✅ App settings ayarlandı"
    
    # Connection string
    az webapp config connection-string set \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --connection-string-type PostgreSQL \
        --settings DefaultConnection="Host=$DB_SERVER_NAME.postgres.database.azure.com;Database=planca;Username=$DB_ADMIN_USER@$DB_SERVER_NAME;Password=$DB_ADMIN_PASSWORD;SSL Mode=Require;" \
        --output none
    echo "✅ Database connection string ayarlandı"
    
    # Deploy
    cd publish
    zip -r ../demo-deployment.zip . > /dev/null 2>&1
    cd ..
    
    az webapp deployment source config-zip \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --src demo-deployment.zip \
        --output none
    echo "✅ Uygulama deploy edildi"
    
    # Restart
    az webapp restart --resource-group $RESOURCE_GROUP --name $WEB_APP_NAME --output none
    echo "✅ Uygulama yeniden başlatıldı"
}

# 4. Test et
test_deployment() {
    echo "🧪 Deployment test ediliyor..."
    
    APP_URL="https://$WEB_APP_NAME.azurewebsites.net"
    
    # 30 saniye bekle
    echo "⏱️ Uygulamanın başlaması bekleniyor..."
    sleep 30
    
    # Health check
    for i in {1..10}; do
        if curl -f "$APP_URL/health" > /dev/null 2>&1; then
            echo "✅ Health check başarılı!"
            break
        else
            if [ $i -eq 10 ]; then
                echo "❌ Health check başarısız!"
                echo "URL: $APP_URL/health"
                echo "Azure logs kontrol edin."
                return 1
            fi
            echo "⏳ Deneme $i/10 başarısız, tekrar deneniyor..."
            sleep 10
        fi
    done
}

# 5. Demo verilerini oluştur
create_demo_data() {
    echo "📊 Demo verileri oluşturuluyor..."
    
    APP_URL="https://$WEB_APP_NAME.azurewebsites.net"
    API_URL="$APP_URL/api"
    
    # Kullanıcı kaydı
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
        echo "✅ Demo kullanıcısı oluşturuldu"
    else
        echo "⚠️ Kullanıcı zaten mevcut veya hata oluştu"
    fi
    
    # Login
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -c demo-cookies.txt \
        -d '{
            "email": "demo@planca.com",
            "password": "Demo123!"
        }')
    
    if [[ $LOGIN_RESPONSE == *"userId"* ]]; then
        echo "✅ Demo kullanıcısı giriş yaptı"
        
        # İşletme oluştur
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
            echo "✅ Demo işletmesi oluşturuldu (ID: $TENANT_ID)"
            
            # Hizmet ekle
            curl -s -X POST "$API_URL/services" \
                -H "Content-Type: application/json" \
                -H "X-TenantId: $TENANT_ID" \
                -b demo-cookies.txt \
                -d '{
                    "name": "Saç Kesimi",
                    "description": "Profesyonel saç kesimi",
                    "price": 150.00,
                    "durationMinutes": 45,
                    "color": "#4ECDC4",
                    "isActive": true
                }' > /dev/null
            echo "✅ Demo hizmet eklendi"
            
        else
            echo "⚠️ İşletme oluşturulamadı veya zaten mevcut"
        fi
    else
        echo "❌ Demo kullanıcısı giriş yapamadı"
    fi
    
    rm -f demo-cookies.txt
}

# 6. Cleanup
cleanup() {
    rm -f demo-deployment.zip
    rm -rf publish
    rm -f Planca.API/appsettings.Production.json
    rm -f demo-cookies.txt
}

# 7. Sonuçları göster
show_results() {
    echo ""
    echo "🎉 DEMO SETUP TAMAMLANDI!"
    echo "========================"
    echo ""
    echo "🌐 Demo URL: https://$WEB_APP_NAME.azurewebsites.net"
    echo "🏥 Health Check: https://$WEB_APP_NAME.azurewebsites.net/health"
    echo ""
    echo "👤 Demo Giriş Bilgileri:"
    echo "   Email: demo@planca.com"
    echo "   Password: Demo123!"
    echo ""
    echo "🏢 Demo İşletme: Demo Kuaför Salonu"
    echo ""
    echo "🔧 Test Komutları:"
    echo "   curl https://$WEB_APP_NAME.azurewebsites.net/health"
    echo ""
    echo "💰 Tahmini Aylık Maliyet: ~\$8-12"
    echo ""
    echo "🗑️ Kaynakları silmek için:"
    echo "   az group delete --name $RESOURCE_GROUP --yes --no-wait"
    echo ""
    echo "📖 Detaylı test rehberi için demo test scriptini kullanın"
    echo ""
}

# Error handling
trap 'echo "❌ Kurulum başarısız!"; cleanup; exit 1' ERR

# Ana akış
main() {
    # Ön kontroller
    if ! command -v az &> /dev/null; then
        echo "❌ Azure CLI gerekli. 'winget install Microsoft.AzureCLI' ile yükleyin."
        exit 1
    fi
    
    if ! command -v dotnet &> /dev/null; then
        echo "❌ .NET SDK gerekli. .NET 9 SDK'yı yükleyin."
        exit 1
    fi
    
    if ! az account show &> /dev/null; then
        echo "❌ Azure'a giriş yapın: az login"
        exit 1
    fi
    
    # Ana işlemler
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