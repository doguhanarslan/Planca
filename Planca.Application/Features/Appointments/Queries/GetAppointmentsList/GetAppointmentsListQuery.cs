using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Appointments.Queries.GetAppointmentsList
{
    public class GetAppointmentsListQuery : IRequest<PaginatedList<AppointmentDto>>, ITenantRequest, ICacheableQuery<PaginatedList<AppointmentDto>>
    {
        // Sayfalama parametreleri
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

        // Filtreleme parametreleri
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? EmployeeId { get; set; }
        public Guid? CustomerId { get; set; }
        public Guid? ServiceId { get; set; }
        public string Status { get; set; }

        // Sıralama parametreleri
        public string SortBy { get; set; } = "StartTime";
        public bool SortAscending { get; set; } = true;

        // Tenant ID (TenantBehavior tarafından otomatik doldurulacak)
        public Guid TenantId { get; set; }

        // Cache implementation - increase duration for better page navigation experience
        public string CacheKey => $"appointments_list_p{PageNumber}_s{PageSize}_sd{StartDate?.ToShortDateString()}_ed{EndDate?.ToShortDateString()}_eid{EmployeeId}_cid{CustomerId}_sid{ServiceId}_st{Status}_sb{SortBy}_sa{SortAscending}";
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(5); // Increased cache for better navigation experience
        public bool BypassCache { get; set; } = false; // Allow bypassing cache when needed
    }
}