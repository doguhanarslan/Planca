# Planca Docker Setup ve Database Bağlantı Rehberi

## 🚀 Hızlı Başlangıç

### 1. Docker Containers'ı Çalıştırın
```powershell
docker-compose up --build -d
```

### 2. Database Bağlantı Testi
```powershell
.\test-db-connection.ps1
```

### 3. Uygulama Erişimi
- **API**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **Database**: localhost:5432

---

## 🔧 Database Bağlantı Yapılandırması

### Docker Environment Connection Strings

**Development (Docker Local):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db;Database=planca;Username=postgres;Password=postgres"
  }
}
```

**Production (Azure):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=planca-demo-db-06082350.postgres.database.azure.com;Database=planca;Username=plancaadmin;Password=DemoPlanca123!@#;SSL Mode=Require;Trust Server Certificate=true;"
  }
}
```

### Environment Konfigürasyonu
- **Docker Local**: `ASPNETCORE_ENVIRONMENT=Development`
- **Azure Deploy**: `ASPNETCORE_ENVIRONMENT=Production`

---

## 🐛 Sorun Giderme

### 1. Database Bağlantı Sorunları

**Semptomlar:**
- API başlatılırken database connection hatası
- "Host not found" veya "Connection refused" hataları

**Çözümler:**
```powershell
# Container'ların durumunu kontrol edin
docker ps

# Database health check
docker exec planca_db pg_isready -U postgres -d planca

# Network bağlantısını test edin
docker exec planca_api ping db

# API loglarını kontrol edin
docker logs planca_api --tail 50
```

### 2. Port Çakışması

**Semptomlar:**
- "Port already in use" hatası

**Çözüm:**
```powershell
# Çakışan portları kontrol edin
netstat -ano | findstr :8080
netstat -ano | findstr :5432

# Çakışan process'i durdurun veya farklı port kullanın
```

### 3. Database Migration Sorunları

**Manuel Migration Çalıştırma:**
```powershell
# API container'ına bağlanın
docker exec -it planca_api bash

# Migration çalıştırın
dotnet ef database update
```

---

## 📋 Container Yapılandırması

### API Container
- **Port**: 8080 (HTTP), 8081 (HTTPS)
- **Environment**: Development
- **Database Host**: `db` (Docker network service name)
- **Health Check**: `/health` endpoint

### Database Container
- **Image**: postgres:15
- **Port**: 5432
- **Database**: planca
- **Username**: postgres
- **Password**: postgres
- **Health Check**: `pg_isready`

### Network
- **Name**: planca-network
- **Driver**: bridge
- **Services**: api, db

---

## 🔄 Development Workflow

### 1. Code Değişikliği Sonrası
```powershell
# Container'ları yeniden build edin
docker-compose up --build

# Sadece API'yi yeniden build etmek için
docker-compose up --build api
```

### 2. Database Reset
```powershell
# Container'ları durdurun
docker-compose down

# Volume'ları silin (database data)
docker volume prune

# Yeniden başlatın
docker-compose up --build -d
```

### 3. Logs İzleme
```powershell
# Tüm servislerin logları
docker-compose logs -f

# Sadece API logs
docker-compose logs -f api

# Sadece DB logs
docker-compose logs -f db
```

---

## 🚀 Production Deployment

### Azure Container Apps için
1. `ASPNETCORE_ENVIRONMENT=Production` set edin
2. Azure PostgreSQL connection string kullanın
3. SSL sertifikalarını yapılandırın
4. Environment variables'ı Azure portal'dan set edin

### Connection String Override
```bash
# Environment variable ile override
export ConnectionStrings__DefaultConnection="Host=your-azure-db;Database=planca;Username=admin;Password=xxx;SSL Mode=Require"
```

---

## ✅ Başarılı Kurulum Kontrolü

Aşağıdaki komutların hepsi başarılı sonuç vermeli:

```powershell
# 1. Container'lar çalışıyor mu?
docker ps | findstr planca

# 2. Database erişilebilir mi?
docker exec planca_db pg_isready -U postgres -d planca

# 3. API health check
curl http://localhost:8080/health

# 4. Network connectivity
docker exec planca_api ping db

# 5. Connection string doğru mu?
docker exec planca_api env | findstr ConnectionStrings
```

Tüm testler başarılı ise sistem hazır! 🎉 