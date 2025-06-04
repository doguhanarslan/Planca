using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;

namespace Planca.Application.Features.Settings.Queries.GetNotificationSettings
{
    /// <summary>
    /// Get notification settings query
    /// </summary>
    public class GetNotificationSettingsQuery : IRequest<Result<NotificationSettingsDto>>, ITenantRequest, ICacheableQuery<Result<NotificationSettingsDto>>
    {
        public Guid TenantId { get; set; }
        public string CacheKey => "notification_settings";
        public TimeSpan? CacheDuration => TimeSpan.FromHours(1);
    }
}