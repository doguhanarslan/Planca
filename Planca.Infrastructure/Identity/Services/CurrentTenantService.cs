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
        
        // This is to store the tenant ID for the current scope when needed
        // (especially useful in background services or repository calls)
        private static AsyncLocal<Guid?> _currentTenantId = new AsyncLocal<Guid?>();

        public CurrentTenantService(
            IHttpContextAccessor httpContextAccessor, 
            ILogger<CurrentTenantService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }
        
        public void SetCurrentTenantId(Guid tenantId)
        {
            if (tenantId != Guid.Empty)
            {
                _currentTenantId.Value = tenantId;
                _logger.LogDebug("Explicitly setting current tenant ID to: {TenantId}", tenantId);
            }
        }

        public Guid GetTenantId()
        {
            // First check if we have a tenant ID set via SetCurrentTenantId
            if (_currentTenantId.Value.HasValue && _currentTenantId.Value.Value != Guid.Empty)
            {
                _logger.LogDebug("Returning tenant ID from AsyncLocal: {TenantId}", _currentTenantId.Value.Value);
                return _currentTenantId.Value.Value;
            }
            
            // Check if it's already set in the HttpContext.Items (from middleware)
            if (_httpContextAccessor.HttpContext?.Items["TenantId"] is Guid guid && guid != Guid.Empty)
            {
                _logger.LogDebug("Returning tenant ID from HttpContext.Items: {TenantId}", guid);
                return guid;
            }

            // Try to get from JWT token claims
            var tenantIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("TenantId");
            if (tenantIdClaim != null && Guid.TryParse(tenantIdClaim.Value, out var claimTenantId) && claimTenantId != Guid.Empty)
            {
                // Store it in HttpContext.Items for future use
                if (_httpContextAccessor.HttpContext != null)
                    _httpContextAccessor.HttpContext.Items["TenantId"] = claimTenantId;
                
                _logger.LogDebug("Returning tenant ID from claims: {TenantId}", claimTenantId);
                return claimTenantId;
            }

            // Try to get from header
            if (_httpContextAccessor.HttpContext?.Request.Headers.ContainsKey(TenantIdHeaderName) == true)
            {
                var headerValue = _httpContextAccessor.HttpContext.Request.Headers[TenantIdHeaderName].ToString();
                if (Guid.TryParse(headerValue, out var headerTenantId) && headerTenantId != Guid.Empty)
                {
                    // Store it in HttpContext.Items for future use
                    if (_httpContextAccessor.HttpContext != null)
                        _httpContextAccessor.HttpContext.Items["TenantId"] = headerTenantId;
                    
                    _logger.LogDebug("Returning tenant ID from headers: {TenantId}", headerTenantId);
                    return headerTenantId;
                }
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