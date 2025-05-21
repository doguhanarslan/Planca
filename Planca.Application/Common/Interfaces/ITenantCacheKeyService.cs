using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Common.Interfaces
{
    public interface ITenantCacheKeyService
    {
        string BuildCacheKey(string baseKey, Guid? tenantId = null);
        string BuildPatternKey(string basePattern, Guid? tenantId = null);
    }
}
