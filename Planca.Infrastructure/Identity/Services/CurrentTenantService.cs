using System;
using Microsoft.AspNetCore.Http;
using Planca.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using System.Threading;

namespace Planca.Infrastructure.Identity.Services
{
    public class CurrentTenantService : ICurrentTenantService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<CurrentTenantService> _logger;
        private const string TenantIdHeaderName = "X-TenantId";
        private const string TenantNameHeaderName = "X-TenantName";
        
        // AsyncLocal yerine HttpContext.Items kullanacağız
        private const string AsyncLocalTenantIdKey = "AsyncLocal_TenantId";
        private const string HttpContextTenantIdKey = "CurrentTenant_TenantId";

        public CurrentTenantService(
            IHttpContextAccessor httpContextAccessor, 
            ILogger<CurrentTenantService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }
        
        public void SetCurrentTenantId(Guid tenantId)
        {
            // Her zaman Guid değerini logla
            _logger.LogInformation("SetCurrentTenantId çağrıldı: {TenantId}", tenantId);
            
            if (tenantId == Guid.Empty)
            {
                _logger.LogWarning("Attempted to set empty tenant ID, ignoring");
                return;
            }

            if (_httpContextAccessor.HttpContext != null)
            {
                // HttpContext.Items içine tenant ID'yi kaydet
                _httpContextAccessor.HttpContext.Items[AsyncLocalTenantIdKey] = tenantId;
                _httpContextAccessor.HttpContext.Items[HttpContextTenantIdKey] = tenantId;
                _httpContextAccessor.HttpContext.Items["TenantId"] = tenantId;
                _logger.LogInformation("Set current tenant ID in HttpContext.Items: {TenantId}", tenantId);
            }
            else
            {
                _logger.LogWarning("HttpContext is null, cannot set tenant ID: {TenantId}", tenantId);
            }
        }

        public Guid GetTenantId()
        {
            // HttpContext kontrolü
            if (_httpContextAccessor.HttpContext == null)
            {
                _logger.LogWarning("HttpContext is null in GetTenantId, returning Guid.Empty");
                return Guid.Empty;
            }
            
            // Öncelikle bizim belirlediğimiz key'den kontrol et
            if (_httpContextAccessor.HttpContext.Items.TryGetValue(HttpContextTenantIdKey, out var httpContextValue) && 
                httpContextValue is Guid httpContextGuid && httpContextGuid != Guid.Empty)
            {
                _logger.LogDebug("Returning tenant ID from HttpContextTenantIdKey: {TenantId}", httpContextGuid);
                return httpContextGuid;
            }
            
            // Sonra AsyncLocal key'inden kontrol et
            if (_httpContextAccessor.HttpContext.Items.TryGetValue(AsyncLocalTenantIdKey, out var asyncLocalValue) && 
                asyncLocalValue is Guid asyncLocalGuid && asyncLocalGuid != Guid.Empty)
            {
                _logger.LogDebug("Returning tenant ID from AsyncLocalTenantIdKey: {TenantId}", asyncLocalGuid);
                return asyncLocalGuid;
            }
            
            // Normal TenantId'den kontrol et
            if (_httpContextAccessor.HttpContext.Items.TryGetValue("TenantId", out var tenantIdItem) && 
                tenantIdItem is Guid tenantIdGuid && tenantIdGuid != Guid.Empty)
            {
                _logger.LogDebug("Returning tenant ID from HttpContext.Items[TenantId]: {TenantId}", tenantIdGuid);
                return tenantIdGuid;
            }

            // Gerekirse diğer kaynaklardan dene
            
            // JWT claim'den dene
            var tenantIdClaim = _httpContextAccessor.HttpContext.User?.FindFirst("TenantId");
            if (tenantIdClaim != null && Guid.TryParse(tenantIdClaim.Value, out var claimTenantId) && claimTenantId != Guid.Empty)
            {
                // HttpContext.Items'a kaydet
                _httpContextAccessor.HttpContext.Items["TenantId"] = claimTenantId;
                _httpContextAccessor.HttpContext.Items[AsyncLocalTenantIdKey] = claimTenantId;
                
                _logger.LogDebug("Returning tenant ID from claims: {TenantId}", claimTenantId);
                return claimTenantId;
            }

            // Header'dan dene
            if (_httpContextAccessor.HttpContext.Request.Headers.TryGetValue(TenantIdHeaderName, out var tenantIdHeader) &&
                Guid.TryParse(tenantIdHeader, out var headerTenantId) && headerTenantId != Guid.Empty)
            {
                // HttpContext.Items'a kaydet
                _httpContextAccessor.HttpContext.Items["TenantId"] = headerTenantId;
                _httpContextAccessor.HttpContext.Items[AsyncLocalTenantIdKey] = headerTenantId;
                
                _logger.LogDebug("Returning tenant ID from headers: {TenantId}", headerTenantId);
                return headerTenantId;
            }
            
            _logger.LogWarning("No valid tenant ID found in any source, returning Guid.Empty");
            return Guid.Empty;
        }

        public string GetTenantName()
        {
            if (_httpContextAccessor.HttpContext?.Items["TenantName"] is string name)
            {
                return name;
            }

            // Try to get from header
            if (_httpContextAccessor.HttpContext?.Request.Headers.ContainsKey(TenantNameHeaderName) == true)
            {
                return _httpContextAccessor.HttpContext.Request.Headers[TenantNameHeaderName].ToString();
            }

            return null;
        }

        public bool IsValid()
        {
            return GetTenantId() != Guid.Empty;
        }
    }
}