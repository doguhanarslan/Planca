using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Planca.Application.Common.Services;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Services
{
    public class DataRetentionBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DataRetentionBackgroundService> _logger;
        private readonly DataRetentionOptions _options;

        public DataRetentionBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<DataRetentionBackgroundService> logger,
            IOptions<DataRetentionOptions> options)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
            _options = options.Value;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (!_options.AutoPurgeEnabled)
            {
                _logger.LogInformation("Data retention auto-purge is disabled");
                return;
            }

            _logger.LogInformation("Data retention background service started. Interval: {IntervalMinutes} minutes", 
                _options.PurgeIntervalMinutes);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await DoWork();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during data retention cleanup");
                }

                await Task.Delay(TimeSpan.FromMinutes(_options.PurgeIntervalMinutes), stoppingToken);
            }
        }

        private async Task DoWork()
        {
            using var scope = _serviceProvider.CreateScope();
            var retentionService = scope.ServiceProvider.GetRequiredService<IDataRetentionService>();

            _logger.LogInformation("Starting scheduled data retention cleanup");

            // Önce istatistikleri al
            var statsBefore = await retentionService.GetRetentionStatsAsync();
            
            _logger.LogInformation("Stats before cleanup - Total: {Total}, Deleted: {Deleted} ({Percentage:F1}%), Storage: {StorageMB}MB",
                statsBefore.TotalRecords, 
                statsBefore.DeletedRecords, 
                statsBefore.DeletedPercentage,
                statsBefore.EstimatedStorageMB);

            // Eski kayıtları temizle
            await retentionService.PurgeOldDeletedRecordsAsync(_options.PurgeAfter);

            // Archive işlemi yap
            await retentionService.ArchiveDeletedRecordsAsync(_options.ArchiveAfter);

            // Temizlik sonrası istatistikler
            var statsAfter = await retentionService.GetRetentionStatsAsync();
            
            var cleanedRecords = statsBefore.DeletedRecords - statsAfter.DeletedRecords;
            var freedSpaceMB = statsBefore.EstimatedStorageMB - statsAfter.EstimatedStorageMB;

            _logger.LogInformation("Cleanup completed - Cleaned: {CleanedRecords} records, Freed space: {FreedMB}MB",
                cleanedRecords, freedSpaceMB);
        }
    }
} 