using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<ServiceRepository> _logger;

        public ServiceRepository(
            ApplicationDbContext dbContext, 
            ICurrentTenantService currentTenantService,
            ILogger<ServiceRepository> logger)
            : base(dbContext)
        {
            _currentTenantService = currentTenantService;
            _logger = logger;
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
        
        public async Task<(List<Service> Services, int TotalCount)> GetServicesByTenantIdAsync(
            Guid tenantId,
            string searchString = null,
            bool? isActive = null,
            decimal? maxPrice = null,
            string sortBy = "Name",
            bool sortAscending = true,
            int pageSize = 10,
            int skip = 0)
        {
            try
            {
                _logger.LogInformation("Fetching services for tenant: {TenantId}", tenantId);
                
                // Log current database context state
                _logger.LogDebug("Current DbContext state - Database provider: {Provider}", 
                    _dbContext.Database.ProviderName);
                
                // Check if tenantId is valid
                if (tenantId == Guid.Empty)
                {
                    _logger.LogWarning("Invalid TenantId (Guid.Empty) provided to GetServicesByTenantIdAsync");
                    return (new List<Service>(), 0);
                }
                
                _logger.LogInformation("Using tenant ID: {TenantId}", tenantId);
                
                // Açıkça CurrentTenantService'i güncelle ve loglama ekle
                _logger.LogInformation("Mevcut tenant ID: {TenantId}", _currentTenantService.GetTenantId());
                _currentTenantService.SetCurrentTenantId(tenantId);
                _logger.LogInformation("Yeni tenant ID: {TenantId}", _currentTenantService.GetTenantId());
                
                // Global query filter ile ilgili sorundan dolayı, sorguya açıkça tenant ID filtresi ekle ve
                // IgnoreQueryFilters kullanarak global filtreden kaçın
                var baseQuery = _dbContext.Services
                    .AsNoTracking();
                // ÖNEMLI: Önce hiçbir filtre olmadan toplam kayıt sayısını alıyoruz
                int allRecordsCount = await baseQuery.CountAsync();
                _logger.LogInformation("Total count of all services for tenant {TenantId} (no filters): {Count}", 
                    tenantId, allRecordsCount);
                
                // Arama filtresi filtreleri hazırlama
                var query = baseQuery;
                
                // Apply search filter if provided
                if (!string.IsNullOrEmpty(searchString))
                {
                    string searchLower = searchString.ToLower();
                    query = query.Where(s => s.Name.ToLower().Contains(searchLower) || 
                                           (s.Description != null && s.Description.ToLower().Contains(searchLower)));
                }
                
                // Apply active filter if provided
                if (isActive.HasValue)
                {
                    _logger.LogDebug("Applying IsActive filter: {IsActive}", isActive.Value);
                    query = query.Where(s => s.IsActive == isActive.Value);
                }
                
                // Apply max price filter if provided
                if (maxPrice.HasValue && maxPrice.Value > 0)
                {
                    _logger.LogDebug("Applying MaxPrice filter: {MaxPrice}", maxPrice.Value);
                    query = query.Where(s => s.Price <= maxPrice.Value);
                }
                
                // Get total count AFTER applying filters
                int totalCount = await query.CountAsync();
                _logger.LogInformation("Total count after applying filters: {Count}", totalCount);
                
                // Apply sorting
                IQueryable<Service> sortedQuery = sortBy.ToLower() switch
                {
                    "name" => sortAscending ? query.OrderBy(s => s.Name) : query.OrderByDescending(s => s.Name),
                    "price" => sortAscending ? query.OrderBy(s => s.Price) : query.OrderByDescending(s => s.Price),
                    "duration" => sortAscending ? query.OrderBy(s => s.DurationMinutes) : query.OrderByDescending(s => s.DurationMinutes),
                    "createdat" => sortAscending ? query.OrderBy(s => s.CreatedAt) : query.OrderByDescending(s => s.CreatedAt),
                    _ => sortAscending ? query.OrderBy(s => s.Name) : query.OrderByDescending(s => s.Name)
                };
                
                // Apply pagination and execute query
                var services = await sortedQuery
                    .Skip(skip)
                    .Take(pageSize)
                    .ToListAsync();
                    
                _logger.LogInformation("Retrieved {Count} services after pagination from total of {Total}", 
                    services.Count, totalCount);
                
                // Ekstra doğrulama - DISTINCT ID'ler
                var distinctIds = services.Select(s => s.Id).Distinct().Count();
                _logger.LogInformation("Distinct service IDs in result: {Count}", distinctIds);
                
                // Log sample data if available
                if (services.Count > 0)
                {
                    var sample = services.First();
                    _logger.LogDebug("Sample service - Id: {Id}, Name: {Name}, Price: {Price}, TenantId: {TenantId}",
                        sample.Id, sample.Name, sample.Price, sample.TenantId);
                }
                
                return (services, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving services for tenant {TenantId}", tenantId);
                throw;
            }
        }
    }
}