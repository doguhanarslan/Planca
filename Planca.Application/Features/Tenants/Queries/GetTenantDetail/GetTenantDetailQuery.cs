using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Common.Interfaces;
using System;

namespace Planca.Application.Features.Tenants.Queries.GetTenantDetail
{
    public class GetTenantDetailQuery : IRequest<Result<TenantDto>>, ICacheableQuery<Result<TenantDto>>
    {
        public Guid Id { get; set; }
        public string CacheKey => $"tenant_detail_{Id}";
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(30);
    }
}