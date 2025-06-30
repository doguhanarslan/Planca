using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Features.Appointments.Commands.CreateGuestAppointment
{
    public class CreateGuestAppointmentCommand : IRequest<Result<AppointmentDto>>
    {
        // Guest customer bilgileri
        public string GuestFirstName { get; set; }
        public string GuestLastName { get; set; }
        public string GuestEmail { get; set; }
        public string GuestPhoneNumber { get; set; }
        public string CustomerMessage { get; set; }

        // Randevu bilgileri
        public Guid ServiceId { get; set; }
        public Guid EmployeeId { get; set; }
        public DateTime StartTime { get; set; }
        public string Notes { get; set; }

        // Tenant ID (Public API'den gelecek)
        public Guid TenantId { get; set; }
    }
}
