using MediatR;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Tenants.Queries.GetTenantsList
{
    public class GetTenantsListQuery : IRequest<PaginatedList<TenantDto>>, ICacheableQuery<PaginatedList<TenantDto>>
    {
        // Existing properties
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchString { get; set; }
        public bool? IsActive { get; set; }
        public string SortBy { get; set; } = "Name";
        public bool SortAscending { get; set; } = true;

        // New properties for caching
        public string CacheKey => $"tenants_list_p{PageNumber}_s{PageSize}_q{SearchString}_ia{IsActive}_sb{SortBy}_sa{SortAscending}";
        public TimeSpan? CacheDuration => TimeSpan.FromHours(2); // Longer duration for tenants as they change infrequently
        public bool BypassCache { get; set; } = false;
    }
}