using System;
using System.Threading.Tasks;

namespace Planca.Application.Common.Services
{
    public interface IDataRetentionService
    {
        /// <summary>
        /// Belirtilen süre kadar soft delete edilmiş kayıtları hard delete eder
        /// </summary>
        Task PurgeOldDeletedRecordsAsync(TimeSpan retentionPeriod);
        
        /// <summary>
        /// Tenant bazında eski silinen kayıtları temizler
        /// </summary>
        Task PurgeTenantDeletedRecordsAsync(Guid tenantId, TimeSpan retentionPeriod);
        
        /// <summary>
        /// Silinen kayıtları archive tablosuna taşır
        /// </summary>
        Task ArchiveDeletedRecordsAsync(TimeSpan archiveAfter);
        
        /// <summary>
        /// Veritabanı boyut istatistiklerini döndürür
        /// </summary>
        Task<DataRetentionStats> GetRetentionStatsAsync();
    }

    public class DataRetentionStats
    {
        public long TotalRecords { get; set; }
        public long DeletedRecords { get; set; }
        public long ArchivableRecords { get; set; }
        public decimal DeletedPercentage { get; set; }
        public long EstimatedStorageMB { get; set; }
    }
} 