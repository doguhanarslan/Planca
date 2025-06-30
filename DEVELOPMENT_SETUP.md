# Planca - Geliştirme Ortamı Kurulumu

Bu guide, Planca uygulamasını yerel geliştirme ortamında çalıştırmak için gerekli adımları içerir.

## Ön Gereksinimler

### Yazılım Gereksinimleri
- **Visual Studio Community 2022** (veya üzeri)
- **PostgreSQL** (14.0 veya üzeri)
- **Node.js** (18.0 veya üzeri) 
- **Google Chrome** (tarayıcı)
- **.NET 8.0 SDK**

### PostgreSQL Kurulumu
1. [PostgreSQL](https://www.postgresql.org/download/windows/) indirin ve kurun
2. Kurulum sırasında şifre belirlemeyi unutmayın (varsayılan: `postgres`)
3. Port: `5432` (varsayılan)

## Veritabanı Kurulumu

### 1. PostgreSQL Veritabanı Oluşturma
```sql
-- PostgreSQL'e bağlanın ve aşağıdaki komutları çalıştırın:
CREATE DATABASE planca;
CREATE USER planca_user WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE planca TO planca_user;
```

### 2. Bağlantı Ayarları Kontrolü
`Planca.API/appsettings.Development.json` dosyasında veritabanı bağlantısı:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=planca;Username=postgres;Password=postgres"
  }
}
```

## API Kurulumu ve Çalıştırma

### 1. Visual Studio'da Projeyi Açma
1. `Planca.sln` dosyasını Visual Studio Community ile açın
2. Solution Explorer'da `Planca.API` projesini sağ tıklayın
3. "Set as Startup Project" seçin

### 2. Launch Profile Seçimi
1. Visual Studio'da Debug dropdown'ından **"Development (Chrome)"** profilini seçin
2. Bu profil API'yi Chrome'da açacak şekilde yapılandırılmıştır

### 3. API'yi Çalıştırma
1. F5 tuşuna basın veya "Start Debugging" tıklayın
2. İlk çalıştırmada migrations otomatik olarak uygulanacak
3. Seed data otomatik olarak oluşturulacak
4. Swagger UI Chrome'da açılacak: `https://localhost:7100/swagger`

## Client Kurulumu ve Çalıştırma

### 1. Bağımlılıkları Yükleme
```bash
cd planca-client
npm install
```

### 2. Development Environment Ayarları
`.env.development` dosyası otomatik olarak oluşturulmuştur:
```
VITE_API_URL=https://localhost:7100/api
```

### 3. Client'ı Çalıştırma
```bash
npm run dev
```

Client şu adreste açılacak: `http://localhost:5173`

## Test Kullanıcıları

Sistem otomatik olarak test kullanıcıları oluşturur. Seed data için `ApplicationDbContextSeed.cs` dosyasına bakın.

## Önemli Portlar

- **API (HTTPS)**: `https://localhost:7100`
- **API (HTTP)**: `http://localhost:5100`
- **Client**: `http://localhost:5173`
- **PostgreSQL**: `localhost:5432`

## CORS Ayarları

Development ortamında aşağıdaki origin'ler otomatik olarak izin verilir:
- `http://localhost:3000`
- `http://localhost:5173`
- `https://localhost:3000`
- `https://localhost:5173`

## Sorun Giderme

### PostgreSQL Bağlantı Sorunu
- PostgreSQL servisinin çalıştığından emin olun
- Kullanıcı adı/şifre kombinasyonunu kontrol edin
- Port 5432'nin açık olduğundan emin olun

### SSL Sertifika Uyarısı
- Chrome'da güvenlik uyarısı gelirse "Advanced" → "Proceed to localhost" tıklayın
- Development sertifikası için bu normal bir durumdur

### Migration Sorunları
- Package Manager Console'da aşağıdaki komutları çalıştırın:
```bash
Update-Database
```

## Deployment

Production deployment için Azure konfigürasyonları korunmuştur. Demo site Azure'da çalışmaya devam edecektir. 