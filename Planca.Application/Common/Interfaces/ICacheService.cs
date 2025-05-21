using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Common.Interfaces
{
    public interface ICacheService
    {
        Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null, bool bypassCache = false);
        Task RemoveAsync(string key);
        Task RemoveByPatternAsync(string pattern);
        Task<T> GetAsync<T>(string key);
        Task SetAsync<T>(string key, T value, TimeSpan? expiration = null);
        Task<bool> ExistsAsync(string key);
    }
}
