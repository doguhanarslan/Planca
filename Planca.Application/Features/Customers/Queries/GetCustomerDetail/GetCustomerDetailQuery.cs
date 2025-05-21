using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Common.Interfaces;

namespace Planca.Application.Features.Customers.Queries.GetCustomerDetail
{
    public class GetCustomerDetailQuery : IRequest<Result<CustomerDto>>, ITenantRequest, ICacheableQuery<Result<CustomerDto>>
    {
        // Görüntülenecek müşterinin kimliği
        public Guid Id { get; set; }

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }
        public string CacheKey => $"customer_detail_{Id}";
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(30);

    }
}