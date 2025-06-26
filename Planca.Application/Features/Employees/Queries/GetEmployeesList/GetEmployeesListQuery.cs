using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Employees.Queries.GetEmployeesList
{
    public class GetEmployeesListQuery : IRequest<PaginatedList<EmployeeDto>>, ITenantRequest, ICacheableQuery<PaginatedList<EmployeeDto>>
    {
        // Sayfalama parametreleri
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        // Filtreleme parametreleri (isteğe bağlı)
        public string? SearchString { get; set; }
        public bool? IsActive { get; set; }
        public Guid? ServiceId { get; set; }
        public string SortBy { get; set; } = "LastName";
        public bool SortAscending { get; set; } = true;

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }

        public string CacheKey => $"employees_list_p{PageNumber}_s{PageSize}_q{SearchString}_ia{IsActive}_sid{ServiceId}_sb{SortBy}_sa{SortAscending}";
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(30);
    }
}