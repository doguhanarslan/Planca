using Microsoft.EntityFrameworkCore;
using Planca.Application.Common.Interfaces;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Infrastructure.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Persistence.Repositories
{
    public class ServiceRepository : BaseRepository<Service>, IServiceRepository
    {
        private readonly ICurrentTenantService _currentTenantService;

        public ServiceRepository(ApplicationDbContext dbContext, ICurrentTenantService currentTenantService)
            : base(dbContext)
        {
            _currentTenantService = currentTenantService;
        }

        public async Task<IEnumerable<Service>> GetActiveServicesAsync()
        {
            return await _dbContext.Services
                .Where(s => s.IsActive)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Service>> GetServicesByEmployeeIdAsync(Guid employeeId)
        {
            var employee = await _dbContext.Employees
                .Include(e => e.ServiceIds)
                .FirstOrDefaultAsync(e => e.Id == employeeId);

            if (employee == null || employee.ServiceIds == null || !employee.ServiceIds.Any())
            {
                return new List<Service>();
            }

            return await _dbContext.Services
                .Where(s => employee.ServiceIds.Contains(s.Id) && s.IsActive)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task<bool> IsServiceNameUniqueAsync(string name, Guid? excludeId = null)
        {
            var query = _dbContext.Services.AsQueryable();

            if (excludeId.HasValue)
            {
                query = query.Where(s => s.Id != excludeId.Value);
            }

            return !await query.AnyAsync(s => s.Name.ToLower() == name.ToLower());
        }
    }
}