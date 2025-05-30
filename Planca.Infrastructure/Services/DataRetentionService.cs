using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Planca.Application.Common.Services;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Infrastructure.Persistence.Context;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Services
{
    public class DataRetentionService : IDataRetentionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DataRetentionService> _logger;
        private readonly DataRetentionOptions _options;

        public DataRetentionService(
            ApplicationDbContext context,
            ILogger<DataRetentionService> logger,
            IOptions<DataRetentionOptions> options)
        {
            _context = context;
            _logger = logger;
            _options = options.Value;
        }

        public async Task PurgeOldDeletedRecordsAsync(TimeSpan retentionPeriod)
        {
            var cutoffDate = DateTime.UtcNow.Subtract(retentionPeriod);
            
            _logger.LogInformation("Starting purge of deleted records older than {CutoffDate}", cutoffDate);

            // Customers (randevularla birlikte)
            var deletedCustomers = await _context.Customers
                .IgnoreQueryFilters()
                .Where(c => c.IsDeleted && c.DeletedAt < cutoffDate)
                .ToListAsync();

            if (deletedCustomers.Any())
            {
                // İlgili randevuları da hard delete et
                var customerIds = deletedCustomers.Select(c => c.Id).ToList();
                var relatedAppointments = await _context.Appointments
                    .IgnoreQueryFilters()
                    .Where(a => customerIds.Contains(a.CustomerId))
                    .ToListAsync();

                _context.Appointments.RemoveRange(relatedAppointments);
                _context.Customers.RemoveRange(deletedCustomers);
                
                _logger.LogInformation("Hard deleted {CustomerCount} customers and {AppointmentCount} related appointments", 
                    deletedCustomers.Count, relatedAppointments.Count);
            }

            // Employees
            var deletedEmployees = await _context.Employees
                .IgnoreQueryFilters()
                .Where(e => e.IsDeleted && e.DeletedAt < cutoffDate)
                .ToListAsync();

            if (deletedEmployees.Any())
            {
                _context.Employees.RemoveRange(deletedEmployees);
                _logger.LogInformation("Hard deleted {Count} employees", deletedEmployees.Count);
            }

            // Services
            var deletedServices = await _context.Services
                .IgnoreQueryFilters()
                .Where(s => s.IsDeleted && s.DeletedAt < cutoffDate)
                .ToListAsync();

            if (deletedServices.Any())
            {
                _context.Services.RemoveRange(deletedServices);
                _logger.LogInformation("Hard deleted {Count} services", deletedServices.Count);
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Purge operation completed");
        }

        public async Task PurgeTenantDeletedRecordsAsync(Guid tenantId, TimeSpan retentionPeriod)
        {
            var cutoffDate = DateTime.UtcNow.Subtract(retentionPeriod);
            
            _logger.LogInformation("Starting tenant-specific purge for {TenantId}", tenantId);

            var deletedCount = 0;

            // Customers
            var customers = await _context.Customers
                .IgnoreQueryFilters()
                .Where(c => c.TenantId == tenantId && c.IsDeleted && c.DeletedAt < cutoffDate)
                .ToListAsync();
            
            _context.Customers.RemoveRange(customers);
            deletedCount += customers.Count;

            // Employees
            var employees = await _context.Employees
                .IgnoreQueryFilters()
                .Where(e => e.TenantId == tenantId && e.IsDeleted && e.DeletedAt < cutoffDate)
                .ToListAsync();
            
            _context.Employees.RemoveRange(employees);
            deletedCount += employees.Count;

            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Purged {Count} records for tenant {TenantId}", deletedCount, tenantId);
        }

        public async Task ArchiveDeletedRecordsAsync(TimeSpan archiveAfter)
        {
            var cutoffDate = DateTime.UtcNow.Subtract(archiveAfter);
            
            // Bu implementation'da basitçe log tutalım
            // Gerçek uygulamada archive tablosuna taşırız
            
            var stats = await GetRetentionStatsAsync();
            
            _logger.LogInformation("Archive candidates: {Count} records older than {Date}", 
                stats.ArchivableRecords, cutoffDate);
                
            // TODO: Implement actual archiving to separate tables
        }

        public async Task<DataRetentionStats> GetRetentionStatsAsync()
        {
            var totalCustomers = await _context.Customers.IgnoreQueryFilters().CountAsync();
            var deletedCustomers = await _context.Customers
                .IgnoreQueryFilters()
                .Where(c => c.IsDeleted)
                .CountAsync();

            var totalEmployees = await _context.Employees.IgnoreQueryFilters().CountAsync();
            var deletedEmployees = await _context.Employees
                .IgnoreQueryFilters()
                .Where(e => e.IsDeleted)
                .CountAsync();

            var totalServices = await _context.Services.IgnoreQueryFilters().CountAsync();
            var deletedServices = await _context.Services
                .IgnoreQueryFilters()
                .Where(s => s.IsDeleted)
                .CountAsync();

            var totalRecords = totalCustomers + totalEmployees + totalServices;
            var deletedRecords = deletedCustomers + deletedEmployees + deletedServices;

            var archivableCutoff = DateTime.UtcNow.Subtract(_options.ArchiveAfter);
            var archivableRecords = await _context.Customers
                .IgnoreQueryFilters()
                .Where(c => c.IsDeleted && c.DeletedAt < archivableCutoff)
                .CountAsync();

            return new DataRetentionStats
            {
                TotalRecords = totalRecords,
                DeletedRecords = deletedRecords,
                ArchivableRecords = archivableRecords,
                DeletedPercentage = totalRecords > 0 ? (decimal)deletedRecords / totalRecords * 100 : 0,
                EstimatedStorageMB = deletedRecords * 2 // Rough estimate: 2KB per record
            };
        }
    }

    public class DataRetentionOptions
    {
        public const string SectionName = "DataRetention";
        
        /// <summary>
        /// Bu süreden eski silinen kayıtlar hard delete edilir
        /// </summary>
        public TimeSpan PurgeAfter { get; set; } = TimeSpan.FromDays(365); // 1 yıl
        
        /// <summary>
        /// Bu süreden eski silinen kayıtlar archive edilir
        /// </summary>
        public TimeSpan ArchiveAfter { get; set; } = TimeSpan.FromDays(90); // 3 ay
        
        /// <summary>
        /// Otomatik temizlik aktif mi?
        /// </summary>
        public bool AutoPurgeEnabled { get; set; } = true;
        
        /// <summary>
        /// Temizlik işlemi ne sıklıkla çalışsın? (dakika)
        /// </summary>
        public int PurgeIntervalMinutes { get; set; } = 1440; // 24 saat
    }
} 