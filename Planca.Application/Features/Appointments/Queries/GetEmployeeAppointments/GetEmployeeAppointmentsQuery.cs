using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;
using System.Collections.Generic;

namespace Planca.Application.Features.Appointments.Queries.GetEmployeeAppointments
{
    public class GetEmployeeAppointmentsQuery : IRequest<Result<List<AppointmentDto>>>, ITenantRequest
    {
        // Çalışan ID'si
        public Guid EmployeeId { get; set; }

        // Tarih aralığı
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // Durum filtresi (opsiyonel)
        public string Status { get; set; }

        // Tenant ID (TenantBehavior tarafından otomatik doldurulacak)
        public Guid TenantId { get; set; }
    }
}