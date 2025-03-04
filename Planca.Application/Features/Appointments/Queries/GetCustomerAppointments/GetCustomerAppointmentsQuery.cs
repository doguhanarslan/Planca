using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;
using System.Collections.Generic;

namespace Planca.Application.Features.Appointments.Queries.GetCustomerAppointments
{
    public class GetCustomerAppointmentsQuery : IRequest<Result<List<AppointmentDto>>>, ITenantRequest
    {
        // Müşteri ID'si
        public Guid CustomerId { get; set; }

        // Opsiyonel tarih filtreleri
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        // Opsiyonel durum filtresi
        public string Status { get; set; }

        // Yalnızca gelecekteki randevuları getir
        public bool FutureOnly { get; set; } = false;

        // Yalnızca geçmiş randevuları getir
        public bool PastOnly { get; set; } = false;

        // Sıralama (varsayılan olarak yaklaşan randevular önce)
        public bool SortAscending { get; set; } = true;

        // Tenant ID (TenantBehavior tarafından otomatik doldurulacak)
        public Guid TenantId { get; set; }
    }
}