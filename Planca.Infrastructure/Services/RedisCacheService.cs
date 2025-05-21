// Planca.Infrastructure/Services/RedisCacheService.cs
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Planca.Application.Common.Interfaces;
using Planca.Infrastructure.Configuration;
using StackExchange.Redis;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Planca.Infrastructure.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _distributedCache;
        private readonly ITenantCacheKeyService _tenantCacheKeyService;
        private readonly ILogger<RedisCacheService> _logger;
        private readonly CacheSettings _cacheSettings;
        private readonly IConnectionMultiplexer _redisConnection;

        public RedisCacheService(
            IDistributedCache distributedCache,
            ITenantCacheKeyService tenantCacheKeyService,
            IOptions<CacheSettings> cacheSettings,
            IConnectionMultiplexer redisConnection,
            ILogger<RedisCacheService> logger)
        {
            _distributedCache = distributedCache;
            _tenantCacheKeyService = tenantCacheKeyService;
            _logger = logger;
            _cacheSettings = cacheSettings.Value;
            _redisConnection = redisConnection;
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

            var cachedValue = await GetAsync<T>(cacheKey);
            if (cachedValue != null)
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

        public async Task<T> GetAsync<T>(string key)
        {
            var cacheKey = _tenantCacheKeyService.BuildCacheKey(key);

            try
            {
                var cachedData = await _distributedCache.GetStringAsync(cacheKey);

                if (string.IsNullOrEmpty(cachedData))
                {
                    return default;
                }

                // Add options to handle the constructor-based deserialization
                

                return Newtonsoft.Json.JsonConvert.DeserializeObject<T>(cachedData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving data from cache for key: {CacheKey}. Returning default value.", cacheKey);
                return default;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
        {
            var cacheKey = _tenantCacheKeyService.BuildCacheKey(key);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(_cacheSettings.DefaultExpirationMinutes)
            };

            try
            {
                var serializerOptions = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                var jsonData = JsonSerializer.Serialize(value, serializerOptions);
                await _distributedCache.SetStringAsync(cacheKey, jsonData, options);
                _logger.LogInformation("Added to cache: {CacheKey}", cacheKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting cache for key: {CacheKey}", cacheKey);
            }
        }

        public async Task RemoveAsync(string key)
        {
            var cacheKey = _tenantCacheKeyService.BuildCacheKey(key);

            try
            {
                await _distributedCache.RemoveAsync(cacheKey);
                _logger.LogInformation("Removed from cache: {CacheKey}", cacheKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing from cache for key: {CacheKey}", cacheKey);
            }
        }

        public async Task RemoveByPatternAsync(string pattern)
        {
            var patternKey = _tenantCacheKeyService.BuildPatternKey(pattern);

            try
            {
                var server = _redisConnection.GetServer(_redisConnection.GetEndPoints()[0]);
                var keys = server.Keys(pattern: patternKey);

                var db = _redisConnection.GetDatabase();
                foreach (var key in keys)
                {
                    await db.KeyDeleteAsync(key);
                }

                _logger.LogInformation("Removed keys matching pattern: {Pattern}", patternKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing keys by pattern: {Pattern}", patternKey);
            }
        }

        public async Task<bool> ExistsAsync(string key)
        {
            var cacheKey = _tenantCacheKeyService.BuildCacheKey(key);

            try
            {
                var db = _redisConnection.GetDatabase();
                return await db.KeyExistsAsync(cacheKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking key existence: {CacheKey}", cacheKey);
                return false;
            }
        }
    }
}