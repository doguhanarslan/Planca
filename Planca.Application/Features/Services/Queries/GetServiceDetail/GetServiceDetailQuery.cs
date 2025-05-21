using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Common.Interfaces;
using System;

namespace Planca.Application.Features.Services.Queries.GetServiceDetail
{
    public class GetServiceDetailQuery : IRequest<Result<ServiceDto>>, ITenantRequest, ICacheableQuery<Result<ServiceDto>>
    {
        // Görüntülenecek servis ID'si
        public Guid Id { get; set; }

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }
        public string CacheKey => $"service_detail_{Id}";
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(30);
    }
}