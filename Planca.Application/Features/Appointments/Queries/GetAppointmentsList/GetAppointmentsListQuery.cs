using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Appointments.Queries.GetAppointmentsList
{
    public class GetAppointmentsListQuery : IRequest<PaginatedList<AppointmentDto>>, ITenantRequest
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
    }
}