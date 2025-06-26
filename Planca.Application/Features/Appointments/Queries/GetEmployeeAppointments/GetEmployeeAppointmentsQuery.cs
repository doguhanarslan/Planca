using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;
using System.Collections.Generic;

namespace Planca.Application.Features.Appointments.Queries.GetEmployeeAppointments
{
    public class GetEmployeeAppointmentsQuery : IRequest<Result<List<AppointmentDto>>>, ITenantRequest, ICacheableQuery<Result<List<AppointmentDto>>>
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

        // Cache implementation - increase duration for better page navigation experience
        public string CacheKey => $"employee_appointments_{EmployeeId}_sd{StartDate:yyyyMMdd}_ed{EndDate:yyyyMMdd}_st{Status}";
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(5); // Increased cache for better navigation experience
        public bool BypassCache { get; set; } = false; // Allow bypassing cache when needed
    }
}