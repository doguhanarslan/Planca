using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Common.Interfaces;

namespace Planca.Application.Features.Customers.Queries.GetCustomersList
{
    public class GetCustomersListQuery : IRequest<PaginatedList<CustomerDto>>, ITenantRequest, ICacheableQuery<PaginatedList<CustomerDto>>
    {
        // Sayfalama parametreleri
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        // Filtreleme parametreleri (isteğe bağlı)
        public string SearchString { get; set; }
        public string SortBy { get; set; } = "LastName";
        public bool SortAscending { get; set; } = true;

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }
        public string CacheKey => $"customers_list_p{PageNumber}_s{PageSize}_q{SearchString}_sb{SortBy}_sa{SortAscending}";
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(15);
        public bool BypassCache { get; set; } = false;
    }
}