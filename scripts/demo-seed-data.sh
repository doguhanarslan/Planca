#!/bin/bash

# 🎯 Planca API - Demo Data Seeding
# Bu script demo verilerini API üzerinden oluşturur

set -e

# Renkli output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Planca API - Demo Data Seeding${NC}"
echo "================================="
echo ""

# Environment dosyasını yükle
load_environment() {
    if [ -f ".env.azure" ]; then
        echo -e "${BLUE}📁 Azure konfigürasyonu yükleniyor...${NC}"
        source .env.azure
        echo -e "${GREEN}✅ Konfigürasyon yüklendi${NC}"
        echo "• App URL: $APP_URL"
    else
        echo -e "${RED}❌ .env.azure dosyası bulunamadı!${NC}"
        echo "Önce ./demo-azure-setup.sh scriptini çalıştırın."
        exit 1
    fi
}

# Ön kontroller
check_prerequisites() {
    echo -e "${BLUE}🔍 Ön kontroller...${NC}"
    
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl gerekli.${NC}"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️ jq önerilir ama zorunlu değil.${NC}"
    fi
    
    # App URL kontrolü
    if [ -z "$APP_URL" ]; then
        echo -e "${RED}❌ APP_URL bulunamadı!${NC}"
        exit 1
    fi
    
    # Health check
    echo -e "${BLUE}🏥 API health check...${NC}"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/health" || echo "000")
    
    if [ "$HTTP_STATUS" != "200" ]; then
        echo -e "${RED}❌ API erişilebilir değil (HTTP $HTTP_STATUS)${NC}"
        echo "Önce uygulamayı deploy edin: ./demo-deployment.sh"
        exit 1
    fi
    
    echo -e "${GREEN}✅ API erişilebilir${NC}"
}

# Demo kullanıcıları oluştur
create_demo_users() {
    echo -e "${BLUE}👥 Demo kullanıcıları oluşturuluyor...${NC}"
    
    API_URL="$APP_URL/api"
    
    # Admin kullanıcısı
    echo -e "${BLUE}👑 Admin kullanıcısı oluşturuluyor...${NC}"
    ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
        -H "Content-Type: application/json" \
        -w "HTTPSTATUS:%{http_code}" \
        -d '{
            "email": "admin@planca.com",
            "password": "Admin123!",
            "firstName": "Admin",
            "lastName": "User",
            "userName": "admin"
        }')
    
    ADMIN_HTTP_STATUS=$(echo $ADMIN_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    ADMIN_BODY=$(echo $ADMIN_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$ADMIN_HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Admin kullanıcısı oluşturuldu${NC}"
        ADMIN_USER_ID=$(echo $ADMIN_BODY | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
    else
        echo -e "${YELLOW}⚠️ Admin kullanıcısı zaten mevcut olabilir (HTTP $ADMIN_HTTP_STATUS)${NC}"
    fi
    
    # Demo kullanıcısı
    echo -e "${BLUE}👤 Demo kullanıcısı oluşturuluyor...${NC}"
    DEMO_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
        -H "Content-Type: application/json" \
        -w "HTTPSTATUS:%{http_code}" \
        -d '{
            "email": "demo@planca.com",
            "password": "Demo123!",
            "firstName": "Demo",
            "lastName": "User",
            "userName": "demouser"
        }')
    
    DEMO_HTTP_STATUS=$(echo $DEMO_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    DEMO_BODY=$(echo $DEMO_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$DEMO_HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Demo kullanıcısı oluşturuldu${NC}"
        DEMO_USER_ID=$(echo $DEMO_BODY | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
    else
        echo -e "${YELLOW}⚠️ Demo kullanıcısı zaten mevcut olabilir (HTTP $DEMO_HTTP_STATUS)${NC}"
    fi
    
    # Employee kullanıcısı
    echo -e "${BLUE}💼 Employee kullanıcısı oluşturuluyor...${NC}"
    EMP_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
        -H "Content-Type: application/json" \
        -w "HTTPSTATUS:%{http_code}" \
        -d '{
            "email": "employee@planca.com",
            "password": "Employee123!",
            "firstName": "Employee",
            "lastName": "User",
            "userName": "employee"
        }')
    
    EMP_HTTP_STATUS=$(echo $EMP_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$EMP_HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Employee kullanıcısı oluşturuldu${NC}"
    else
        echo -e "${YELLOW}⚠️ Employee kullanıcısı zaten mevcut olabilir (HTTP $EMP_HTTP_STATUS)${NC}"
    fi
}

# Demo işletmesi oluştur
create_demo_business() {
    echo -e "${BLUE}🏢 Demo işletmesi oluşturuluyor...${NC}"
    
    API_URL="$APP_URL/api"
    
    # Demo kullanıcısı ile login
    echo -e "${BLUE}🔐 Demo kullanıcısı ile giriş...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -c demo-cookies.txt \
        -w "HTTPSTATUS:%{http_code}" \
        -d '{
            "email": "demo@planca.com",
            "password": "Demo123!"
        }')
    
    LOGIN_HTTP_STATUS=$(echo $LOGIN_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    LOGIN_BODY=$(echo $LOGIN_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$LOGIN_HTTP_STATUS" != "200" ]; then
        echo -e "${RED}❌ Demo kullanıcısı giriş yapamadı (HTTP $LOGIN_HTTP_STATUS)${NC}"
        echo "Response: $LOGIN_BODY"
        return 1
    fi
    
    echo -e "${GREEN}✅ Demo kullanıcısı giriş yaptı${NC}"
    
    # İşletme oluştur
    echo -e "${BLUE}🏪 Demo işletmesi kaydediliyor...${NC}"
    BUSINESS_RESPONSE=$(curl -s -X POST "$API_URL/auth/create-business" \
        -H "Content-Type: application/json" \
        -b demo-cookies.txt \
        -w "HTTPSTATUS:%{http_code}" \
        -d '{
            "name": "Demo Güzellik Salonu",
            "subdomain": "demo-salon",
            "primaryColor": "#FF6B6B",
            "address": "Atatürk Mahallesi, Güzellik Sokak No:15",
            "city": "İstanbul",
            "state": "İstanbul",
            "zipCode": "34070",
            "workingHours": [
                {"day": 1, "openTimeString": "09:00", "closeTimeString": "18:00"},
                {"day": 2, "openTimeString": "09:00", "closeTimeString": "18:00"},
                {"day": 3, "openTimeString": "09:00", "closeTimeString": "18:00"},
                {"day": 4, "openTimeString": "09:00", "closeTimeString": "18:00"},
                {"day": 5, "openTimeString": "09:00", "closeTimeString": "18:00"},
                {"day": 6, "openTimeString": "10:00", "closeTimeString": "16:00"}
            ]
        }')
    
    BUSINESS_HTTP_STATUS=$(echo $BUSINESS_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    BUSINESS_BODY=$(echo $BUSINESS_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$BUSINESS_HTTP_STATUS" = "200" ]; then
        TENANT_ID=$(echo $BUSINESS_BODY | grep -o '"businessId":"[^"]*' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Demo işletmesi oluşturuldu (Tenant ID: $TENANT_ID)${NC}"
        
        # Tenant ID'yi kaydet
        echo "TENANT_ID=\"$TENANT_ID\"" >> .env.azure
        
        return 0
    else
        echo -e "${YELLOW}⚠️ İşletme oluşturulamadı veya zaten mevcut (HTTP $BUSINESS_HTTP_STATUS)${NC}"
        echo "Response: $BUSINESS_BODY"
        
        # Mevcut tenant ID'yi bulmaya çalış
        echo -e "${BLUE}🔍 Mevcut tenant ID aranıyor...${NC}"
        CURRENT_USER_RESPONSE=$(curl -s -X GET "$API_URL/auth/current-user" \
            -b demo-cookies.txt)
        
        if [[ $CURRENT_USER_RESPONSE == *"tenantId"* ]]; then
            TENANT_ID=$(echo $CURRENT_USER_RESPONSE | grep -o '"tenantId":"[^"]*' | cut -d'"' -f4)
            echo -e "${GREEN}✅ Mevcut tenant ID bulundu: $TENANT_ID${NC}"
            echo "TENANT_ID=\"$TENANT_ID\"" >> .env.azure
        fi
        
        return 0
    fi
}

# Demo hizmetleri oluştur
create_demo_services() {
    echo -e "${BLUE}💇 Demo hizmetleri oluşturuluyor...${NC}"
    
    if [ -z "$TENANT_ID" ]; then
        echo -e "${RED}❌ Tenant ID bulunamadı!${NC}"
        return 1
    fi
    
    API_URL="$APP_URL/api"
    
    # Hizmet listesi
    declare -a SERVICES=(
        '{
            "name": "Kadın Saç Kesimi",
            "description": "Profesyonel kadın saç kesimi ve şekillendirme",
            "price": 200.00,
            "durationMinutes": 60,
            "color": "#FF6B6B",
            "isActive": true
        }'
        '{
            "name": "Erkek Saç Kesimi",
            "description": "Klasik ve modern erkek saç kesimi",
            "price": 120.00,
            "durationMinutes": 45,
            "color": "#4ECDC4",
            "isActive": true
        }'
        '{
            "name": "Saç Boyama",
            "description": "Tam kafa saç boyama işlemi",
            "price": 450.00,
            "durationMinutes": 150,
            "color": "#45B7D1",
            "isActive": true
        }'
        '{
            "name": "Manikür",
            "description": "Profesyonel manikür ve nail art",
            "price": 150.00,
            "durationMinutes": 75,
            "color": "#96CEB4",
            "isActive": true
        }'
        '{
            "name": "Pedikür",
            "description": "Rahatlatıcı pedikür hizmeti",
            "price": 180.00,
            "durationMinutes": 90,
            "color": "#FFEAA7",
            "isActive": true
        }'
        '{
            "name": "Kaş Tasarımı",
            "description": "Profesyonel kaş şekillendirme",
            "price": 80.00,
            "durationMinutes": 30,
            "color": "#DDA0DD",
            "isActive": true
        }'
        '{
            "name": "Yüz Bakımı",
            "description": "Detoksifiye edici yüz bakım paketi",
            "price": 300.00,
            "durationMinutes": 90,
            "color": "#F8BBD9",
            "isActive": true
        }'
    )
    
    SERVICE_COUNT=0
    for service in "${SERVICES[@]}"; do
        RESPONSE=$(curl -s -X POST "$API_URL/services" \
            -H "Content-Type: application/json" \
            -H "X-TenantId: $TENANT_ID" \
            -b demo-cookies.txt \
            -w "HTTPSTATUS:%{http_code}" \
            -d "$service")
        
        HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        
        if [ "$HTTP_STATUS" = "200" ]; then
            ((SERVICE_COUNT++))
            SERVICE_NAME=$(echo $service | grep -o '"name":"[^"]*' | cut -d'"' -f4)
            echo -e "${GREEN}✅ Hizmet eklendi: $SERVICE_NAME${NC}"
        else
            SERVICE_NAME=$(echo $service | grep -o '"name":"[^"]*' | cut -d'"' -f4)
            echo -e "${YELLOW}⚠️ Hizmet eklenemedi: $SERVICE_NAME (HTTP $HTTP_STATUS)${NC}"
        fi
        
        sleep 1 # Rate limiting için
    done
    
    echo -e "${GREEN}✅ $SERVICE_COUNT hizmet başarıyla eklendi${NC}"
}

# Demo müşterileri oluştur
create_demo_customers() {
    echo -e "${BLUE}👥 Demo müşterileri oluşturuluyor...${NC}"
    
    if [ -z "$TENANT_ID" ]; then
        echo -e "${RED}❌ Tenant ID bulunamadı!${NC}"
        return 1
    fi
    
    API_URL="$APP_URL/api"
    
    # Müşteri listesi
    declare -a CUSTOMERS=(
        '{
            "firstName": "Ayşe",
            "lastName": "Yılmaz",
            "email": "ayse.yilmaz@example.com",
            "phoneNumber": "+90555111222",
            "notes": "Saç boyama konusunda hassas"
        }'
        '{
            "firstName": "Mehmet",
            "lastName": "Demir",
            "email": "mehmet.demir@example.com",
            "phoneNumber": "+90555333444",
            "notes": "Her ay düzenli gelir"
        }'
        '{
            "firstName": "Zeynep",
            "lastName": "Kaya",
            "email": "zeynep.kaya@example.com",
            "phoneNumber": "+90555555666",
            "notes": "Manikür uzmanı tercihi var"
        }'
        '{
            "firstName": "Ali",
            "lastName": "Özkan",
            "email": "ali.ozkan@example.com",
            "phoneNumber": "+90555777888",
            "notes": "Kısa saç modelleri tercih eder"
        }'
        '{
            "firstName": "Fatma",
            "lastName": "Şahin",
            "email": "fatma.sahin@example.com",
            "phoneNumber": "+90555999000",
            "notes": "Yüz bakımı konusunda deneyimli"
        }'
    )
    
    CUSTOMER_COUNT=0
    for customer in "${CUSTOMERS[@]}"; do
        RESPONSE=$(curl -s -X POST "$API_URL/customers" \
            -H "Content-Type: application/json" \
            -H "X-TenantId: $TENANT_ID" \
            -b demo-cookies.txt \
            -w "HTTPSTATUS:%{http_code}" \
            -d "$customer")
        
        HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        
        if [ "$HTTP_STATUS" = "200" ]; then
            ((CUSTOMER_COUNT++))
            CUSTOMER_NAME=$(echo $customer | grep -o '"firstName":"[^"]*' | cut -d'"' -f4)
            echo -e "${GREEN}✅ Müşteri eklendi: $CUSTOMER_NAME${NC}"
        else
            CUSTOMER_NAME=$(echo $customer | grep -o '"firstName":"[^"]*' | cut -d'"' -f4)
            echo -e "${YELLOW}⚠️ Müşteri eklenemedi: $CUSTOMER_NAME (HTTP $HTTP_STATUS)${NC}"
        fi
        
        sleep 1
    done
    
    echo -e "${GREEN}✅ $CUSTOMER_COUNT müşteri başarıyla eklendi${NC}"
}

# Demo çalışanları oluştur
create_demo_employees() {
    echo -e "${BLUE}👨‍💼 Demo çalışanları oluşturuluyor...${NC}"
    
    if [ -z "$TENANT_ID" ]; then
        echo -e "${RED}❌ Tenant ID bulunamadı!${NC}"
        return 1
    fi
    
    API_URL="$APP_URL/api"
    
    # Önce hizmetlerin ID'lerini alalım
    SERVICES_RESPONSE=$(curl -s -X GET "$API_URL/services" \
        -H "X-TenantId: $TENANT_ID" \
        -b demo-cookies.txt)
    
    # Çalışan listesi (örnekte tüm hizmetleri verebilecek şekilde)
    declare -a EMPLOYEES=(
        '{
            "firstName": "Esra",
            "lastName": "Güzel",
            "email": "esra.guzel@demosalon.com",
            "phoneNumber": "+90555111333",
            "title": "Kıdemli Kuaför",
            "isActive": true,
            "serviceIds": [],
            "workingHours": [
                {"dayOfWeek": 1, "startTime": "09:00", "endTime": "18:00", "isWorkingDay": true},
                {"dayOfWeek": 2, "startTime": "09:00", "endTime": "18:00", "isWorkingDay": true},
                {"dayOfWeek": 3, "startTime": "09:00", "endTime": "18:00", "isWorkingDay": true},
                {"dayOfWeek": 4, "startTime": "09:00", "endTime": "18:00", "isWorkingDay": true},
                {"dayOfWeek": 5, "startTime": "09:00", "endTime": "18:00", "isWorkingDay": true},
                {"dayOfWeek": 6, "startTime": "10:00", "endTime": "16:00", "isWorkingDay": true}
            ]
        }'
        '{
            "firstName": "Murat",
            "lastName": "Berber",
            "email": "murat.berber@demosalon.com",
            "phoneNumber": "+90555222444",
            "title": "Berber",
            "isActive": true,
            "serviceIds": [],
            "workingHours": [
                {"dayOfWeek": 1, "startTime": "10:00", "endTime": "19:00", "isWorkingDay": true},
                {"dayOfWeek": 2, "startTime": "10:00", "endTime": "19:00", "isWorkingDay": true},
                {"dayOfWeek": 3, "startTime": "10:00", "endTime": "19:00", "isWorkingDay": true},
                {"dayOfWeek": 4, "startTime": "10:00", "endTime": "19:00", "isWorkingDay": true},
                {"dayOfWeek": 5, "startTime": "10:00", "endTime": "19:00", "isWorkingDay": true},
                {"dayOfWeek": 0, "startTime": "11:00", "endTime": "17:00", "isWorkingDay": true}
            ]
        }'
        '{
            "firstName": "Selin",
            "lastName": "Nail",
            "email": "selin.nail@demosalon.com",
            "phoneNumber": "+90555333555",
            "title": "Nail Art Uzmanı",
            "isActive": true,
            "serviceIds": [],
            "workingHours": [
                {"dayOfWeek": 2, "startTime": "09:00", "endTime": "17:00", "isWorkingDay": true},
                {"dayOfWeek": 3, "startTime": "09:00", "endTime": "17:00", "isWorkingDay": true},
                {"dayOfWeek": 4, "startTime": "09:00", "endTime": "17:00", "isWorkingDay": true},
                {"dayOfWeek": 5, "startTime": "09:00", "endTime": "17:00", "isWorkingDay": true},
                {"dayOfWeek": 6, "startTime": "10:00", "endTime": "16:00", "isWorkingDay": true}
            ]
        }'
    )
    
    EMPLOYEE_COUNT=0
    for employee in "${EMPLOYEES[@]}"; do
        RESPONSE=$(curl -s -X POST "$API_URL/employees" \
            -H "Content-Type: application/json" \
            -H "X-TenantId: $TENANT_ID" \
            -b demo-cookies.txt \
            -w "HTTPSTATUS:%{http_code}" \
            -d "$employee")
        
        HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        
        if [ "$HTTP_STATUS" = "200" ]; then
            ((EMPLOYEE_COUNT++))
            EMPLOYEE_NAME=$(echo $employee | grep -o '"firstName":"[^"]*' | cut -d'"' -f4)
            echo -e "${GREEN}✅ Çalışan eklendi: $EMPLOYEE_NAME${NC}"
        else
            EMPLOYEE_NAME=$(echo $employee | grep -o '"firstName":"[^"]*' | cut -d'"' -f4)
            echo -e "${YELLOW}⚠️ Çalışan eklenemedi: $EMPLOYEE_NAME (HTTP $HTTP_STATUS)${NC}"
        fi
        
        sleep 1
    done
    
    echo -e "${GREEN}✅ $EMPLOYEE_COUNT çalışan başarıyla eklendi${NC}"
}

# Cleanup
cleanup() {
    echo -e "${BLUE}🧹 Geçici dosyalar temizleniyor...${NC}"
    rm -f demo-cookies.txt
}

# Test ve doğrulama
verify_data() {
    echo -e "${BLUE}🔍 Demo verileri doğrulanıyor...${NC}"
    
    if [ -z "$TENANT_ID" ]; then
        echo -e "${YELLOW}⚠️ Tenant ID bulunamadı, doğrulama atlanıyor${NC}"
        return 0
    fi
    
    API_URL="$APP_URL/api"
    
    # Hizmetleri kontrol et
    SERVICES_RESPONSE=$(curl -s -X GET "$API_URL/services" \
        -H "X-TenantId: $TENANT_ID" \
        -b demo-cookies.txt)
    
    if [[ $SERVICES_RESPONSE == *"items"* ]]; then
        SERVICE_COUNT=$(echo $SERVICES_RESPONSE | grep -o '"name":' | wc -l)
        echo -e "${GREEN}✅ $SERVICE_COUNT hizmet bulundu${NC}"
    fi
    
    # Müşterileri kontrol et
    CUSTOMERS_RESPONSE=$(curl -s -X GET "$API_URL/customers" \
        -H "X-TenantId: $TENANT_ID" \
        -b demo-cookies.txt)
    
    if [[ $CUSTOMERS_RESPONSE == *"items"* ]]; then
        CUSTOMER_COUNT=$(echo $CUSTOMERS_RESPONSE | grep -o '"firstName":' | wc -l)
        echo -e "${GREEN}✅ $CUSTOMER_COUNT müşteri bulundu${NC}"
    fi
    
    # Çalışanları kontrol et
    EMPLOYEES_RESPONSE=$(curl -s -X GET "$API_URL/employees" \
        -H "X-TenantId: $TENANT_ID" \
        -b demo-cookies.txt)
    
    if [[ $EMPLOYEES_RESPONSE == *"items"* ]]; then
        EMPLOYEE_COUNT=$(echo $EMPLOYEES_RESPONSE | grep -o '"firstName":' | wc -l)
        echo -e "${GREEN}✅ $EMPLOYEE_COUNT çalışan bulundu${NC}"
    fi
}

# Sonuçları göster
show_seed_results() {
    echo ""
    echo -e "${GREEN}🎉 DEMO DATA SEEDING TAMAMLANDI!${NC}"
    echo "=================================="
    echo ""
    echo -e "${BLUE}👥 Oluşturulan Demo Kullanıcıları:${NC}"
    echo "• admin@planca.com (Admin123!)"
    echo "• demo@planca.com (Demo123!)"
    echo "• employee@planca.com (Employee123!)"
    echo ""
    echo -e "${BLUE}🏢 Demo İşletme:${NC}"
    echo "• İsim: Demo Güzellik Salonu"
    echo "• Subdomain: demo-salon"
    if [ ! -z "$TENANT_ID" ]; then
        echo "• Tenant ID: $TENANT_ID"
    fi
    echo ""
    echo -e "${BLUE}💇 Demo Hizmetler:${NC}"
    echo "• Kadın/Erkek Saç Kesimi"
    echo "• Saç Boyama"
    echo "• Manikür/Pedikür"
    echo "• Kaş Tasarımı"
    echo "• Yüz Bakımı"
    echo ""
    echo -e "${BLUE}👥 Demo Veriler:${NC}"
    echo "• 5 Demo Müşteri"
    echo "• 3 Demo Çalışan"
    echo "• 7 Demo Hizmet"
    echo ""
    echo -e "${BLUE}🔗 Test Linkleri:${NC}"
    echo "• App: $APP_URL"
    echo "• API Docs: $APP_URL/swagger"
    echo "• Health: $APP_URL/health"
    echo ""
    echo -e "${BLUE}🧪 Test Komutları:${NC}"
    echo "• Login Test:"
    echo "  curl -X POST $APP_URL/api/auth/login \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"email\": \"demo@planca.com\", \"password\": \"Demo123!\"}'"
    echo ""
    echo -e "${GREEN}✨ Demo hazır! Yukarıdaki bilgilerle test edebilirsiniz.${NC}"
    echo ""
}

# Error handling
trap 'echo -e "${RED}❌ Demo data seeding başarısız!${NC}"; cleanup; exit 1' ERR

# Ana akış
main() {
    load_environment
    echo ""
    check_prerequisites
    echo ""
    create_demo_users
    echo ""
    create_demo_business
    echo ""
    create_demo_services
    echo ""
    create_demo_customers
    echo ""
    create_demo_employees
    echo ""
    verify_data
    echo ""
    cleanup
    show_seed_results
}

# Script parametreleri
while [[ $# -gt 0 ]]; do
    case $1 in
        --users-only)
            USERS_ONLY=true
            shift
            ;;
        --business-only)
            BUSINESS_ONLY=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --users-only      Only create demo users"
            echo "  --business-only   Only create business data"
            echo "  --help           Show this help"
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