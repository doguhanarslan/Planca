using Planca.Domain.Common.Interfaces;
using Planca.Domain.Specifications;
using System;

namespace Planca.Domain.Specifications
{
    public class TenantEntitySpecification<T> : BaseSpecification<T> where T : class, ITenantEntity
    {
        public TenantEntitySpecification(Guid tenantId)
            : base(e => e.TenantId == tenantId)
        {
        }
    }
}