// Planca.Infrastructure/Services/TenantCacheKeyService.cs
using Planca.Application.Common.Interfaces;
using System;

namespace Planca.Infrastructure.Services
{
    public class TenantCacheKeyService : ITenantCacheKeyService
    {
        private readonly ICurrentTenantService _currentTenantService;

        public TenantCacheKeyService(ICurrentTenantService currentTenantService)
        {
            _currentTenantService = currentTenantService;
        }

        // Planca.Infrastructure/Services/TenantCacheKeyService.cs
        public string BuildCacheKey(string baseKey, Guid? tenantId = null)
        {
            // Check if the baseKey already starts with "tenant:"
            if (baseKey.StartsWith("tenant:"))
            {
                // If it already has a tenant prefix, return as is
                return baseKey;
            }

            // Explicit tenant ID verilmemişse, current tenant ID kullan
            var effectiveTenantId = tenantId ?? _currentTenantService.GetTenantId();

            // Tenant ID yoksa ya da Empty ise, multi-tenant olmayan veri olarak düşün
            if (effectiveTenantId == Guid.Empty)
            {
                return $"global:{baseKey}";
            }

            return $"tenant:{effectiveTenantId}:{baseKey}";
        }


        public string BuildPatternKey(string basePattern, Guid? tenantId = null)
        {
            var effectiveTenantId = tenantId ?? _currentTenantService.GetTenantId();

            if (effectiveTenantId == Guid.Empty)
            {
                return $"global:{basePattern}*";
            }

            return $"tenant:{effectiveTenantId}:{basePattern}*";
        }
    }
}