using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.Common.Interfaces;
using System;

namespace Planca.Application.Features.Appointments.Commands.DeleteAppointment
{
    public class DeleteAppointmentCommand : IRequest<Result>, ITenantRequest, ICacheInvalidatorCommand<Result>
    {
        // Silinecek randevu ID'si
        public Guid Id { get; set; }

        // Tenant ID (TenantBehavior tarafından otomatik doldurulacak)
        public Guid TenantId { get; set; }

        public string CacheKeyToInvalidate => null;
        public string CacheKeyPatternToInvalidate => "appointments_list";
    }
}