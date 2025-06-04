using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;

namespace Planca.Application.Features.Settings.Queries.GetBookingSettings
{
    /// <summary>
    /// Get booking settings query
    /// </summary>
    public class GetBookingSettingsQuery : IRequest<Result<BookingSettingsDto>>, ITenantRequest, ICacheableQuery<Result<BookingSettingsDto>>
    {
        public Guid TenantId { get; set; }
        public string CacheKey => "booking_settings";
        public TimeSpan? CacheDuration => TimeSpan.FromHours(1);
    }
}