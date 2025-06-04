using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;
using System.Collections.Generic;

namespace Planca.Application.Features.Settings.Commands.UpdateSettings
{
    /// <summary>
    /// Update settings command
    /// </summary>
    public class UpdateSettingsCommand : IRequest<Result<List<SettingDto>>>, ITenantRequest, ICacheInvalidatorCommand<Result<List<SettingDto>>>
    {
        /// <summary>
        /// Settings to update
        /// </summary>
        public List<SettingItemDto> Settings { get; set; } = new List<SettingItemDto>();

        /// <summary>
        /// Category for bulk update (optional)
        /// </summary>
        public string? Category { get; set; }

        // ITenantRequest implementation
        public Guid TenantId { get; set; }

        // ICacheInvalidatorCommand implementation
        public string CacheKeyToInvalidate => null;
        public string CacheKeyPatternToInvalidate => "settings_list";
    }
}