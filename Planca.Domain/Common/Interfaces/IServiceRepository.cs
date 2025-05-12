using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;

namespace Planca.Domain.Common.Interfaces
{
    public interface IServiceRepository : IRepository<Service>
    {
        Task<IEnumerable<Service>> GetServicesByEmployeeIdAsync(Guid employeeId);
        Task<IEnumerable<Service>> GetActiveServicesAsync();
        Task<bool> IsServiceNameUniqueAsync(string name, Guid? excludeId = null);
        
        Task<(List<Service> Services, int TotalCount)> GetServicesByTenantIdAsync(
            Guid tenantId,
            string searchString = null,
            bool? isActive = null,
            decimal? maxPrice = null,
            string sortBy = "Name",
            bool sortAscending = true,
            int pageSize = 10,
            int skip = 0);
    }
}