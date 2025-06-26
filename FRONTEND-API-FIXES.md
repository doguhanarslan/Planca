# Frontend API Veri Çekme Sorunları - Düzeltmeler

## 🚨 Tespit Edilen Sorunlar

### 1. **TenantId Parameter Karışıklığı**
- **Problem**: Frontend'de bazı yerlerde TenantId query parameter olarak, bazı yerlerde header olarak gönderiliyordu
- **Etki**: Backend'in doğru tenant verilerini döndürememesi
- **Çözüm**: Tüm API çağrılarında TenantId'yi tutarlı şekilde `X-TenantId` header'ı olarak gönderilecek şekilde standardize ettik

### 2. **Response Format Uyumsuzluğu** 
- **Problem**: Backend'den gelen response formatları tutarsızdı:
  - `BaseApiController.HandlePagedResult()` plain object döndürüyor
  - `BaseApiController.HandleActionResult()` `ApiResponse<T>` wrapper döndürüyor
- **Etki**: Frontend'de karmaşık transformation logic'i ve hatalı veri parsing
- **Çözüm**: Response transformation logic'ini backend formatına uygun hale getirdik

### 3. **Cache Invalidation Sorunları**
- **Problem**: RTK Query cache'i çok uzun süre (30 saniye) tutuyordu
- **Etki**: Yeni oluşturulan veriler hemen görünmüyordu
- **Çözüm**: Cache süresini 10 saniyeye düşürdük

## 🔧 Yapılan Düzeltmeler

### 1. `planca-client/src/features/customers/api/customersAPI.ts`
```diff
transformResponse: (response: any): PaginatedList<CustomerDto> => {
+  console.log('Customers API Raw Response:', response);
+  
+  // Backend'den gelen response format kontrolü
+  let actualData = response;
+  
+  // Eğer response ApiResponse<T> formatındaysa
+  if (response?.data && typeof response.data === 'object') {
+    actualData = response.data;
+  }
+  
+  // Backend BaseApiController.HandlePagedResult plain object döndürüyor
+  if (actualData && actualData.items && Array.isArray(actualData.items)) {
+    return {
+      items: actualData.items.map(normalizeCustomerData).filter(Boolean),
+      pageNumber: actualData.pageNumber || 1,
+      totalPages: actualData.totalPages || 0,
+      totalCount: actualData.totalCount || 0,
+      hasNextPage: actualData.hasNextPage || false,
+      hasPreviousPage: actualData.hasPreviousPage || false
+    };
+  }
```

### 2. `planca-client/src/features/appointments/api/appointmentsAPI.ts`
```diff
transformResponse: (response: any) => {
+  console.log('Appointments API Raw Response:', response);
+  
+  // Backend'den gelen response format kontrolü
+  let actualData = response;
+  
+  // Eğer response ApiResponse<T> formatındaysa
+  if (response?.data && typeof response.data === 'object') {
+    actualData = response.data;
+  }
+  
+  // Backend BaseApiController.HandlePagedResult plain object döndürüyor
+  if (actualData && actualData.items && Array.isArray(actualData.items)) {
+    return {
+      items: actualData.items,
+      pageNumber: actualData.pageNumber || 1,
+      totalPages: actualData.totalPages || 0,
+      totalCount: actualData.totalCount || 0,
+      hasNextPage: actualData.hasNextPage || false,
+      hasPreviousPage: actualData.hasPreviousPage || false
+    };
+  }
```

### 3. `planca-client/src/services/dashboardService.ts`
```diff
// TenantId artık query parameter değil, header olarak gönderiliyor
- TenantId: tenantId
+ // TenantId header olarak otomatik gönderilecek

// Response handling iyileştirildi
+ console.log('Dashboard response for count:', response);
+ 
+ // Backend BaseApiController.HandlePagedResult formatı
+ if (response?.data?.totalCount !== undefined) {
+   return response.data.totalCount;
+ }
```

### 4. `planca-client/src/shared/api/base/baseApi.ts`
```diff
- keepUnusedDataFor: 30,
+ keepUnusedDataFor: 10,
```

## 🎯 Backend Uyumluluğu

### TenantId Handling (Zaten Mevcut)
- `CurrentTenantService` zaten `X-TenantId` header'ını okuyabiliyor
- JWT claims'den de TenantId alınabiliyor
- Header priority order: HttpContext.Items → Claims → Headers

### Response Formatları (Mevcut Durum)
- `HandlePagedResult()`: `{ items, pageNumber, totalPages, totalCount, hasNextPage, hasPreviousPage }`
- `HandleActionResult()`: `{ succeeded, data, errors, message }`

## 🧪 Test Senaryoları

### 1. Müşteri Listesi Testi
```javascript
// Browser console'da çalıştırın:
// Network tab'da `/api/Customers` isteğini inceleyin
// Headers'da X-TenantId'nin varlığını kontrol edin
// Response format'ının expected yapıda olduğunu kontrol edin
```

### 2. Dashboard İstatistikleri Testi  
```javascript
// Dashboard sayfasına gidin
// Console'da "Dashboard response for count:" log'larını inceleyin
// İstatistiklerin doğru gösterildiğini kontrol edin
```

### 3. Cache Invalidation Testi
```javascript
// Yeni bir müşteri oluşturun
// 10 saniye içinde listenin güncellenmesini bekleyin
// Dashboard istatistiklerinin güncellenmesini kontrol edin
```

## 🔍 Debug Endpoints

Backend'de debug için endpoint'ler mevcut:
- `GET /api/Appointments/debug` - Tüm randevuları filter olmadan getirir
- `GET /api/Appointments/debug/tenant` - Tenant bilgisi ve filtrelenmiş randevuları getirir

## 📊 Beklenen Sonuçlar

✅ **TenantId Tutarlılığı**: Tüm API çağrılarında `X-TenantId` header'ı  
✅ **Response Consistency**: Tutarlı response parsing  
✅ **Cache Performance**: 10 saniyede data refresh  
✅ **Error Handling**: Gelişmiş fallback mekanizmaları  
✅ **Debug Capability**: Console log'ları ile kolay debugging  

## 🚀 Test Komutu

```powershell
.\test-frontend-api.ps1
```

Bu script size test talimatlarını gösterecektir. 