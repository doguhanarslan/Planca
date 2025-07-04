#!/bin/bash

# 🎯 Planca API - Azure Infrastructure Setup
# Bu script sadece Azure kaynaklarını oluşturur

set -e

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}☁️ Planca API - Azure Infrastructure Setup${NC}"
echo "========================================="
echo ""

# Parametreler (environment variables veya default değerler)
RESOURCE_GROUP=${RESOURCE_GROUP:-"rg-planca-demo-$(date +%m%d%H%M)"}
LOCATION=${LOCATION:-"West Europe"}
DB_SERVER_NAME=${DB_SERVER_NAME:-"planca-db-$(date +%m%d%H%M)"}
WEB_APP_NAME=${WEB_APP_NAME:-"planca-api-$(date +%m%d%H%M)"}
REDIS_NAME=${REDIS_NAME:-"planca-redis-$(date +%m%d%H%M)"}
APP_SERVICE_PLAN=${APP_SERVICE_PLAN:-"asp-planca"}
DB_ADMIN_USER=${DB_ADMIN_USER:-"plancaadmin"}
DB_ADMIN_PASSWORD=${DB_ADMIN_PASSWORD:-"PlancaDemo123!@#"}
SKU_TIER=${SKU_TIER:-"B1"}  # B1, S1, P1V2 vs.

echo -e "${BLUE}📋 Configuration:${NC}"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "Database Server: $DB_SERVER_NAME"
echo "Web App: $WEB_APP_NAME"
echo "Redis Cache: $REDIS_NAME"
echo "SKU Tier: $SKU_TIER"
echo ""

# Onay al
read -p "Bu konfigürasyonla devam etmek istiyor musunuz? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}İptal edildi.${NC}"
    exit 1
fi

# Ön kontroller
check_prerequisites() {
    echo -e "${BLUE}🔍 Ön kontroller...${NC}"
    
    if ! command -v az &> /dev/null; then
        echo -e "${RED}❌ Azure CLI gerekli.${NC}"
        exit 1
    fi
    
    if ! az account show &> /dev/null; then
        echo -e "${RED}❌ Azure'a giriş yapın: az login${NC}"
        exit 1
    fi
    
    # Subscription check
    SUBSCRIPTION=$(az account show --query name --output tsv)
    echo -e "${GREEN}✅ Azure Subscription: $SUBSCRIPTION${NC}"
}

# Resource Group oluştur
create_resource_group() {
    echo -e "${BLUE}📁 Resource Group oluşturuluyor...${NC}"
    
    az group create \
        --name $RESOURCE_GROUP \
        --location "$LOCATION" \
        --tags "Project=Planca" "Environment=Demo" "CreatedBy=Script" \
        --output none
    
    echo -e "${GREEN}✅ Resource Group oluşturuldu: $RESOURCE_GROUP${NC}"
}

# App Service Plan oluştur
create_app_service_plan() {
    echo -e "${BLUE}🖥️ App Service Plan oluşturuluyor...${NC}"
    
    az appservice plan create \
        --name $APP_SERVICE_PLAN \
        --resource-group $RESOURCE_GROUP \
        --location "$LOCATION" \
        --sku $SKU_TIER \
        --is-linux \
        --output none
    
    echo -e "${GREEN}✅ App Service Plan oluşturuldu: $APP_SERVICE_PLAN${NC}"
}

# PostgreSQL oluştur
create_postgresql() {
    echo -e "${BLUE}🐘 PostgreSQL Flexible Server oluşturuluyor...${NC}"
    
    # PostgreSQL Flexible Server
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
        --tags "Project=Planca" "Environment=Demo" \
        --output none
    
    echo -e "${GREEN}✅ PostgreSQL Server oluşturuldu: $DB_SERVER_NAME${NC}"
    
    # Database
    az postgres flexible-server db create \
        --resource-group $RESOURCE_GROUP \
        --server-name $DB_SERVER_NAME \
        --database-name planca \
        --output none
    
    echo -e "${GREEN}✅ Database oluşturuldu: planca${NC}"
    
    # Connection string için gerekli bilgileri kaydet
    echo "DB_CONNECTION_STRING=\"Host=$DB_SERVER_NAME.postgres.database.azure.com;Database=planca;Username=$DB_ADMIN_USER;Password=$DB_ADMIN_PASSWORD;SSL Mode=Require;Trust Server Certificate=true;\"" > .env.azure
}

# Redis Cache oluştur
create_redis() {
    echo -e "${BLUE}📦 Redis Cache oluşturuluyor...${NC}"
    
    # Redis Cache - Basic tier for demo
    az redis create \
        --resource-group $RESOURCE_GROUP \
        --name $REDIS_NAME \
        --location "$LOCATION" \
        --sku Basic \
        --vm-size c0 \
        --tags "Project=Planca" "Environment=Demo" \
        --output none
    
    echo -e "${GREEN}✅ Redis Cache oluşturuldu: $REDIS_NAME${NC}"
    
    # Redis connection string için key al ve kaydet
    REDIS_KEY=$(az redis list-keys --resource-group $RESOURCE_GROUP --name $REDIS_NAME --query primaryKey --output tsv)
    echo "REDIS_CONNECTION_STRING=\"$REDIS_NAME.redis.cache.windows.net:6380,password=$REDIS_KEY,ssl=True,abortConnect=False\"" >> .env.azure
}

# Web App oluştur
create_web_app() {
    echo -e "${BLUE}🌐 Web App oluşturuluyor...${NC}"
    
    az webapp create \
        --resource-group $RESOURCE_GROUP \
        --plan $APP_SERVICE_PLAN \
        --name $WEB_APP_NAME \
        --runtime "DOTNETCORE:9.0" \
        --tags "Project=Planca" "Environment=Demo" \
        --output none
    
    echo -e "${GREEN}✅ Web App oluşturuldu: $WEB_APP_NAME${NC}"
    
    # App URL'i kaydet
    echo "APP_URL=\"https://$WEB_APP_NAME.azurewebsites.net\"" >> .env.azure
    
    # Basic app settings
    az webapp config appsettings set \
        --resource-group $RESOURCE_GROUP \
        --name $WEB_APP_NAME \
        --settings \
            "ASPNETCORE_ENVIRONMENT=Production" \
            "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false" \
        --output none
    
    # Always On aktifleştir (B1+ planlar için)
    if [[ "$SKU_TIER" != "F1" ]]; then
        az webapp config set \
            --resource-group $RESOURCE_GROUP \
            --name $WEB_APP_NAME \
            --always-on true \
            --output none
        echo -e "${GREEN}✅ Always On aktifleştirildi${NC}"
    fi
}

# Application Insights (opsiyonel)
create_app_insights() {
    echo -e "${BLUE}📊 Application Insights oluşturuluyor...${NC}"
    
    # Application Insights workspace
    WORKSPACE_NAME="log-planca-$(date +%m%d%H%M)"
    az monitor log-analytics workspace create \
        --resource-group $RESOURCE_GROUP \
        --workspace-name $WORKSPACE_NAME \
        --location "$LOCATION" \
        --output none
    
    # Application Insights
    APPINSIGHTS_NAME="ai-planca-$(date +%m%d%H%M)"
    az monitor app-insights component create \
        --app $APPINSIGHTS_NAME \
        --location "$LOCATION" \
        --resource-group $RESOURCE_GROUP \
        --workspace $WORKSPACE_NAME \
        --output none
    
    # Connection string al
    APPINSIGHTS_CONNECTION_STRING=$(az monitor app-insights component show \
        --app $APPINSIGHTS_NAME \
        --resource-group $RESOURCE_GROUP \
        --query connectionString \
        --output tsv)
    
    echo "APPINSIGHTS_CONNECTION_STRING=\"$APPINSIGHTS_CONNECTION_STRING\"" >> .env.azure
    echo -e "${GREEN}✅ Application Insights oluşturuldu: $APPINSIGHTS_NAME${NC}"
}

# Sonuçları göster
show_infrastructure_results() {
    echo ""
    echo -e "${GREEN}🎉 AZURE INFRASTRUCTURE HAZIR!${NC}"
    echo "================================="
    echo ""
    echo -e "${BLUE}📋 Oluşturulan Kaynaklar:${NC}"
    echo "• Resource Group: $RESOURCE_GROUP"
    echo "• App Service Plan: $APP_SERVICE_PLAN ($SKU_TIER)"
    echo "• Web App: $WEB_APP_NAME"
    echo "• PostgreSQL: $DB_SERVER_NAME"
    echo "• Redis Cache: $REDIS_NAME"
    echo "• Database: planca"
    echo ""
    echo -e "${BLUE}🔗 Endpoint'ler:${NC}"
    echo "• Web App URL: https://$WEB_APP_NAME.azurewebsites.net"
    echo "• Database Host: $DB_SERVER_NAME.postgres.database.azure.com"
    echo "• Redis Host: $REDIS_NAME.redis.cache.windows.net"
    echo ""
    echo -e "${BLUE}📁 Konfigürasyon:${NC}"
    echo "• Connection strings ve keys '.env.azure' dosyasına kaydedildi"
    echo "• Bu dosyayı deployment script'inde kullanabilirsiniz"
    echo ""
    echo -e "${BLUE}💰 Tahmini Maliyet (Aylık):${NC}"
    case $SKU_TIER in
        "F1") echo "• ~\$5-8 (Free tier limitleri var)" ;;
        "B1") echo "• ~\$15-20" ;;
        "S1") echo "• ~\$30-40" ;;
        "P1V2") echo "• ~\$80-100" ;;
        *) echo "• Tier'a göre değişir" ;;
    esac
    echo ""
    echo -e "${YELLOW}📋 Sonraki Adımlar:${NC}"
    echo "1. ./demo-deployment.sh ile uygulamayı deploy edin"
    echo "2. ./demo-seed-data.sh ile test verilerini oluşturun"
    echo ""
    echo -e "${RED}🗑️ Kaynakları silmek için:${NC}"
    echo "az group delete --name $RESOURCE_GROUP --yes --no-wait"
    echo ""
}

# Environment dosyasını başlat
init_env_file() {
    echo "# Planca Azure Demo Configuration" > .env.azure
    echo "# Generated on $(date)" >> .env.azure
    echo "RESOURCE_GROUP=\"$RESOURCE_GROUP\"" >> .env.azure
    echo "WEB_APP_NAME=\"$WEB_APP_NAME\"" >> .env.azure
    echo "DB_SERVER_NAME=\"$DB_SERVER_NAME\"" >> .env.azure
    echo "REDIS_NAME=\"$REDIS_NAME\"" >> .env.azure
    echo "" >> .env.azure
}

# Error handling
trap 'echo -e "${RED}❌ Infrastructure setup başarısız!${NC}"; exit 1' ERR

# Ana akış
main() {
    check_prerequisites
    echo ""
    init_env_file
    create_resource_group
    echo ""
    create_app_service_plan
    echo ""
    create_postgresql
    echo ""
    create_redis
    echo ""
    create_web_app
    echo ""
    create_app_insights
    echo ""
    show_infrastructure_results
}

# Çalıştır
main