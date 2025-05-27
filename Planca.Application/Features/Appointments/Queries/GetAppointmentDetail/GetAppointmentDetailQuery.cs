using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Appointments.Queries.GetAppointmentDetail
{
    public class GetAppointmentDetailQuery : IRequest<Result<AppointmentDto>>, ITenantRequest, ICacheableQuery<Result<AppointmentDto>>
    {
        // Existing properties
        public Guid Id { get; set; }
        public Guid TenantId { get; set; }

        // New properties for caching
        public string CacheKey => $"appointment_detail_{Id}";
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(15); // Shorter duration for appointments as they change frequently
        public bool BypassCache { get; set; } = false;
    }
}