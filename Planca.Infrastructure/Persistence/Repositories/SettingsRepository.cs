using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Infrastructure.Persistence.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Persistence.Repositories
{
    public class SettingsRepository : BaseRepository<Setting>, ISettingsRepository
    {
        private readonly ILogger<SettingsRepository> _logger;

        public SettingsRepository(
            ApplicationDbContext dbContext,
            ILogger<SettingsRepository> logger)
            : base(dbContext)
        {
            _logger = logger;
        }

        public async Task<Setting> GetByKeyAsync(string key)
        {
            try
            {
                return await _dbContext.Settings
                    .FirstOrDefaultAsync(s => s.Key == key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving setting by key: {Key}", key);
                throw;
            }
        }

        public async Task<IEnumerable<Setting>> GetByCategoryAsync(string category)
        {
            try
            {
                return await _dbContext.Settings
                    .Where(s => s.Category == category)
                    .OrderBy(s => s.DisplayOrder)
                    .ThenBy(s => s.Key)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving settings by category: {Category}", category);
                throw;
            }
        }

        public async Task<IEnumerable<Setting>> GetActiveSettingsAsync()
        {
            try
            {
                return await _dbContext.Settings
                    .Where(s => s.IsActive)
                    .OrderBy(s => s.Category)
                    .ThenBy(s => s.DisplayOrder)
                    .ThenBy(s => s.Key)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active settings");
                throw;
            }
        }

        public async Task<Setting> UpsertSettingAsync(string key, string value, string category = "General", string description = "", string dataType = "string")
        {
            try
            {
                var setting = await GetByKeyAsync(key);

                if (setting != null)
                {
                    // Update existing setting
                    setting.Value = value;
                    setting.LastModifiedAt = DateTime.UtcNow;
                    await UpdateAsync(setting);
                }
                else
                {
                    // Create new setting
                    setting = new Setting
                    {
                        Key = key,
                        Value = value,
                        Category = category,
                        Description = description,
                        DataType = dataType,
                        IsActive = true,
                        IsSystemSetting = false,
                        DisplayOrder = 0,
                        CreatedAt = DateTime.UtcNow
                    };

                    await AddAsync(setting);
                }

                return setting;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error upserting setting: {Key}", key);
                throw;
            }
        }

        public async Task<bool> SettingExistsAsync(string key)
        {
            try
            {
                return await _dbContext.Settings
                    .AnyAsync(s => s.Key == key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if setting exists: {Key}", key);
                throw;
            }
        }

        public async Task<Dictionary<string, string>> GetSettingsDictionaryAsync(string category = null)
        {
            try
            {
                var query = _dbContext.Settings.Where(s => s.IsActive);

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(s => s.Category == category);
                }

                var settings = await query
                    .Select(s => new { s.Key, s.Value })
                    .ToListAsync();

                return settings.ToDictionary(s => s.Key, s => s.Value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving settings dictionary for category: {Category}", category);
                throw;
            }
        }

        public async Task BulkUpdateSettingsAsync(Dictionary<string, string> settings, string category = "General")
        {
            try
            {
                foreach (var kvp in settings)
                {
                    await UpsertSettingAsync(kvp.Key, kvp.Value, category);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk updating settings for category: {Category}", category);
                throw;
            }
        }
    }
}