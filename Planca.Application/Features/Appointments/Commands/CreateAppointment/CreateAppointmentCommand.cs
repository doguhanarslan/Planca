using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;

namespace Planca.Application.Features.Appointments.Commands.CreateAppointment
{
    public class CreateAppointmentCommand : IRequest<Result<AppointmentDto>>, ITenantRequest
    {
        public Guid CustomerId { get; set; }
        public Guid EmployeeId { get; set; }
        public Guid ServiceId { get; set; }
        public DateTime StartTime { get; set; }
        public string Notes { get; set; }

        // Implemented from ITenantRequest, will be set by TenantBehavior
        public Guid TenantId { get; set; }
    }
}
