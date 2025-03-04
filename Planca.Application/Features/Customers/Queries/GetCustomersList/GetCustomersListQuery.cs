using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;

namespace Planca.Application.Features.Customers.Queries.GetCustomersList
{
    public class GetCustomersListQuery : IRequest<PaginatedList<CustomerDto>>, ITenantRequest
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
    }
}