using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace Planca.Domain.Common.Interfaces
{
    public interface ITenantRepository : IRepository<Tenant>
    {
        Task<Tenant> GetTenantBySubdomainAsync(string subdomain);
        Task<bool> IsSubdomainUniqueAsync(string subdomain, Guid? excludeId = null);
        Task<bool> IsTenantActiveAsync(Guid tenantId);

        // YENİ: Slug support için metodlar
        Task<Tenant> GetBySlugAsync(string slug);
        Task<bool> IsSlugUniqueAsync(string slug, Guid? excludeId = null);
    }
}