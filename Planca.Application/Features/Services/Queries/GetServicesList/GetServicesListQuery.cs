using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Services.Queries.GetServicesList
{
    public class GetServicesListQuery : IRequest<PaginatedList<ServiceDto>>, ITenantRequest, ICacheableQuery<PaginatedList<ServiceDto>>
    {
        // Sayfalama parametreleri
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        // Filtreleme parametreleri (isteğe bağlı)
        public string? SearchString { get; set; }
        public bool? IsActive { get; set; }
        public decimal? MaxPrice { get; set; }
        public string SortBy { get; set; } = "Name";
        public bool SortAscending { get; set; } = true;

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }

        public string CacheKey => $"services_list_p{PageNumber}_s{PageSize}_st{SearchString}_ia{IsActive}_mp{MaxPrice}_sb{SortBy}_sa{SortAscending}";
        public TimeSpan? CacheDuration => TimeSpan.FromHours(1); // 10 dakika cache'te tut
        public bool BypassCache { get; set; } = false;
    }
}