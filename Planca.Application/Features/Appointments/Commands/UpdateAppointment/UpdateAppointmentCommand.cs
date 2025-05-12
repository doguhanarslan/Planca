using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Appointments.Commands.UpdateAppointment
{
    public class UpdateAppointmentCommand : IRequest<Result<AppointmentDto>>, ITenantRequest
    {
        // Güncellenecek randevu ID'si
        public Guid Id { get; set; }

        // İlişkili kayıtlar
        public Guid CustomerId { get; set; }
        public Guid EmployeeId { get; set; }
        public Guid ServiceId { get; set; }

        // Zaman bilgileri
        public DateTime StartTime { get; set; }

        // Not: EndTime, Service'in süresine göre hesaplanacak

        // Durum - opsiyonel, null ise değiştirilmeyecek
        public string Status { get; set; }

        // İlave bilgiler
        public string Notes { get; set; }

        // Tenant ID (TenantBehavior tarafından otomatik doldurulacak)
        public Guid TenantId { get; set; }
    }
}