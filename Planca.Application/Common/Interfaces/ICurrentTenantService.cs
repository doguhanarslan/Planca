using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Common.Interfaces
{
    public interface ICurrentTenantService
    {
        Guid GetTenantId();
        string GetTenantName();
        bool IsValid();
    }
}
