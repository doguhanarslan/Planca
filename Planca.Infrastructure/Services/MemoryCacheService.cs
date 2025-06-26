// Planca.Infrastructure/Services/MemoryCacheService.cs
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Planca.Application.Common.Interfaces;
using Planca.Infrastructure.Configuration;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Services
{
    public class MemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ITenantCacheKeyService _tenantCacheKeyService;
        private readonly ILogger<MemoryCacheService> _logger;
        private readonly CacheSettings _cacheSettings;
        private static readonly ConcurrentDictionary<string, string> _cacheKeys = new();

        public MemoryCacheService(
            IMemoryCache memoryCache,
            ITenantCacheKeyService tenantCacheKeyService,
            IOptions<CacheSettings> cacheSettings,
            ILogger<MemoryCacheService> logger)
        {
            _memoryCache = memoryCache;
            _tenantCacheKeyService = tenantCacheKeyService;
            _logger = logger;
            _cacheSettings = cacheSettings.Value;
        }

        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null, bool bypassCache = false)
        {
            var cacheKey = _tenantCacheKeyService.BuildCacheKey(key);

            if (bypassCache || !_cacheSettings.EnableDistributedCache)
            {
                var freshValue = await factory();

                // Bypass olsa bile değeri cache'e yazalım
                if (!bypassCache && freshValue != null)
                {
                    await SetAsync(cacheKey, freshValue, expiration);
                }

                return freshValue;
            }

            if (_memoryCache.TryGetValue(cacheKey, out T cachedValue))
            {
                _logger.LogInformation("Cache hit for key: {CacheKey}", cacheKey);
                return cachedValue;
            }

            _logger.LogInformation("Cache miss for key: {CacheKey}", cacheKey);
            var newValue = await factory();

            if (newValue != null)
            {
                await SetAsync(cacheKey, newValue, expiration);
            }

            return newValue;
        }

        public Task<T> GetAsync<T>(string key)
        {
            var cacheKey = _tenantCacheKeyService.BuildCacheKey(key);

            if (_memoryCache.TryGetValue(cacheKey, out T cachedValue))
            {
                return Task.FromResult(cachedValue);
            }

            return Task.FromResult<T>(default);
        }

        public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
        {
            var cacheKey = _tenantCacheKeyService.BuildCacheKey(key);
            var cacheExpiration = expiration ?? TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes);

            var options = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(cacheExpiration);

            _memoryCache.Set(cacheKey, value, options);
            _cacheKeys.TryAdd(cacheKey, cacheKey);
            
            _logger.LogInformation("💾 Added to memory cache: {CacheKey}", cacheKey);

            return Task.CompletedTask;
        }

        public Task RemoveAsync(string key)
        {
            var cacheKey = _tenantCacheKeyService.BuildCacheKey(key);

            _memoryCache.Remove(cacheKey);
            _cacheKeys.TryRemove(cacheKey, out _);

            return Task.CompletedTask;
        }

        public Task RemoveByPatternAsync(string pattern)
        {
            var patternKey = _tenantCacheKeyService.BuildPatternKey(pattern);
            patternKey = patternKey.TrimEnd('*');

            _logger.LogInformation("🔄 Attempting to remove cache keys matching pattern: {Pattern}, built key: {PatternKey}", pattern, patternKey);

            // Get all keys that match the pattern
            var keysToRemove = new List<string>();
            
            // Split pattern by | to handle multiple patterns
            var patterns = pattern.Split('|', StringSplitOptions.RemoveEmptyEntries);
            
            foreach (var singlePattern in patterns)
            {
                var singlePatternKey = _tenantCacheKeyService.BuildPatternKey(singlePattern.Trim());
                singlePatternKey = singlePatternKey.TrimEnd('*');
                
                // Find keys that match this pattern
                var matchingKeys = _cacheKeys.Keys
                    .Where(k => k.StartsWith(singlePatternKey) || k.Contains(singlePattern.Trim()))
                    .ToList();
                    
                keysToRemove.AddRange(matchingKeys);
                
                _logger.LogInformation("🔍 Pattern '{SinglePattern}' matched {Count} keys", singlePattern, matchingKeys.Count);
            }

            // Remove duplicates
            keysToRemove = keysToRemove.Distinct().ToList();

            _logger.LogInformation("🔍 Total {Count} cache keys to remove: {Keys}", keysToRemove.Count, string.Join(", ", keysToRemove.Take(10)));

            foreach (var key in keysToRemove)
            {
                _memoryCache.Remove(key);
                _cacheKeys.TryRemove(key, out _);
                _logger.LogInformation("🗑️ Removed cache key: {Key}", key);
            }

            return Task.CompletedTask;
        }

        public Task<bool> ExistsAsync(string key)
        {
            var cacheKey = _tenantCacheKeyService.BuildCacheKey(key);
            return Task.FromResult(_memoryCache.TryGetValue(cacheKey, out _));
        }

        /// <summary>
        /// Nuclear option: Clear entire memory cache for immediate updates after mutations
        /// </summary>
        public void ClearAll()
        {
            try
            {
                var allKeys = _cacheKeys.Keys.ToList();
                _logger.LogInformation("💥 NUCLEAR: Clearing {Count} cache entries from memory cache", allKeys.Count);
                
                foreach (var key in allKeys)
                {
                    _memoryCache.Remove(key);
                    _cacheKeys.TryRemove(key, out _);
                }
                
                _logger.LogInformation("💥 Successfully cleared all {Count} cache entries", allKeys.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Failed to clear all cache entries");
            }
        }
    }
}