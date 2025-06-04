using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Planca.Domain.Common.Interfaces
{
    public interface ISettingsRepository : IRepository<Setting>
    {
        /// <summary>
        /// Get setting by key for current tenant
        /// </summary>
        Task<Setting> GetByKeyAsync(string key);

        /// <summary>
        /// Get all settings for a specific category
        /// </summary>
        Task<IEnumerable<Setting>> GetByCategoryAsync(string category);

        /// <summary>
        /// Get all active settings for current tenant
        /// </summary>
        Task<IEnumerable<Setting>> GetActiveSettingsAsync();

        /// <summary>
        /// Update or create a setting by key
        /// </summary>
        Task<Setting> UpsertSettingAsync(string key, string value, string category = "General", string description = "", string dataType = "string");

        /// <summary>
        /// Check if a setting exists by key
        /// </summary>
        Task<bool> SettingExistsAsync(string key);

        /// <summary>
        /// Get settings as dictionary for easy access
        /// </summary>
        Task<Dictionary<string, string>> GetSettingsDictionaryAsync(string category = null);

        /// <summary>
        /// Bulk update settings
        /// </summary>
        Task BulkUpdateSettingsAsync(Dictionary<string, string> settings, string category = "General");
    }
}