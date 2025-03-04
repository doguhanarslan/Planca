using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Appointments.Queries.GetAppointmentDetail
{
    public class GetAppointmentDetailQuery : IRequest<Result<AppointmentDto>>, ITenantRequest
    {
        // Görüntülenecek randevu ID'si
        public Guid Id { get; set; }

        // Tenant ID (TenantBehavior tarafından otomatik doldurulacak)
        public Guid TenantId { get; set; }
    }
}