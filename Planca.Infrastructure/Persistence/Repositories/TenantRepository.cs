using Microsoft.EntityFrameworkCore;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Infrastructure.Persistence.Context;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Persistence.Repositories
{
    public class TenantRepository : BaseRepository<Tenant>, ITenantRepository
    {
        public TenantRepository(ApplicationDbContext dbContext)
            : base(dbContext)
        {
        }

        public async Task<Tenant> GetTenantBySubdomainAsync(string subdomain)
        {
            // Subdomainleri case-insensitive karşılaştır
            return await _dbContext.Tenants
                .FirstOrDefaultAsync(t => t.Subdomain.ToLower() == subdomain.ToLower() && t.IsActive);
        }

        public async Task<bool> IsSubdomainUniqueAsync(string subdomain, Guid? excludeId = null)
        {
            var query = _dbContext.Tenants.Where(t => t.Subdomain.ToLower() == subdomain.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(t => t.Id != excludeId.Value);
            }

            return !(await query.AnyAsync());
        }

        public async Task<bool> IsTenantActiveAsync(Guid tenantId)
        {
            var tenant = await _dbContext.Tenants.FindAsync(tenantId);
            return tenant != null && tenant.IsActive;
        }
    }
}