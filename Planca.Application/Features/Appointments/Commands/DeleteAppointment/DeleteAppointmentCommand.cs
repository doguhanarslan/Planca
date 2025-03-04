using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using System;

namespace Planca.Application.Features.Appointments.Commands.DeleteAppointment
{
    public class DeleteAppointmentCommand : IRequest<Result>, ITenantRequest
    {
        // Silinecek randevu ID'si
        public Guid Id { get; set; }

        // Tenant ID (TenantBehavior tarafından otomatik doldurulacak)
        public Guid TenantId { get; set; }
    }
}