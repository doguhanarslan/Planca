using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;
using System.Collections.Generic;

namespace Planca.Application.Features.Settings.Queries.GetSettings
{
    public class GetSettingsQuery : IRequest<Result<List<SettingsCategoryDto>>>, ITenantRequest, ICacheableQuery<Result<List<SettingsCategoryDto>>>
    {
        /// <summary>
        /// Optional category filter
        /// </summary>
        public string? Category { get; set; }

        /// <summary>
        /// Include inactive settings
        /// </summary>
        public bool IncludeInactive { get; set; } = false;

        /// <summary>
        /// Include system settings
        /// </summary>
        public bool IncludeSystemSettings { get; set; } = false;

        // ITenantRequest implementation
        public Guid TenantId { get; set; }

        // ICacheableQuery implementation
        public string CacheKey => $"settings_list_cat{Category}_ia{IncludeInactive}_is{IncludeSystemSettings}";
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(30);
    }
}
