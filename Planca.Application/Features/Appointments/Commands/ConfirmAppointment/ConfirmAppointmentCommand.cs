using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;
using Planca.Application.Common.Interfaces;

namespace Planca.Application.Features.Appointments.Commands.ConfirmAppointment
{
    public class ConfirmAppointmentCommand : IRequest<Result<AppointmentDto>>, ITenantRequest, ICacheInvalidatorCommand<Result<AppointmentDto>>
    {
        // Onaylanacak randevu ID'si
        public Guid Id { get; set; }

        // İlave notlar (opsiyonel)
        public string Notes { get; set; }

        // Onaylayan kullanıcı türü (Customer, Employee, Admin vb.)
        public string ConfirmedBy { get; set; }

        // Tenant ID (TenantBehavior tarafından otomatik doldurulacak)
        public Guid TenantId { get; set; }

        public string CacheKeyToInvalidate => $"appointment_detail_{Id}";
        public string CacheKeyPatternToInvalidate => "appointments_list|employee_appointments|customer_appointments";
    }
}