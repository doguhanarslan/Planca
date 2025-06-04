using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Settings.Queries.GetBusinessSettings
{
    /// <summary>
    /// Get business settings query
    /// </summary>
    public class GetBusinessSettingsQuery : IRequest<Result<BusinessSettingsDto>>, ITenantRequest, ICacheableQuery<Result<BusinessSettingsDto>>
    {
        public Guid TenantId { get; set; }
        public string CacheKey => "business_settings";
        public TimeSpan? CacheDuration => TimeSpan.FromHours(1);
    }
}