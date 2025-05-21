using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Common.Interfaces
{
    public interface ICacheableQuery<TResponse>
    {
        string CacheKey { get; }
        TimeSpan? CacheDuration { get; }
        bool BypassCache { get; }
    }
}
