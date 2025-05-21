using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Common.Interfaces;

namespace Planca.Application.Features.Appointments.Commands.CreateAppointment
{
    public class CreateAppointmentCommand : IRequest<Result<AppointmentDto>>, ITenantRequest, ICacheInvalidatorCommand<Result<AppointmentDto>>
    {
        public Guid CustomerId { get; set; }
        public Guid EmployeeId { get; set; }
        public Guid ServiceId { get; set; }
        public DateTime StartTime { get; set; }
        public string Notes { get; set; }

        // Implemented from ITenantRequest, will be set by TenantBehavior
        public Guid TenantId { get; set; }

        public string CacheKeyToInvalidate => null;
        public string CacheKeyPatternToInvalidate => "appointments_list|employees_list|customers_list|services_list";
    }
}
