using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Appointments.Commands.DeleteAppointment
{
    public class DeleteAppointmentCommandHandler : IRequestHandler<DeleteAppointmentCommand, Result>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;

        public DeleteAppointmentCommandHandler(
            IAppointmentRepository appointmentRepository,
            IUnitOfWork unitOfWork,
            ICacheService cacheService)
        {
            _appointmentRepository = appointmentRepository;
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
        }

        // Update Planca.Application/Features/Appointments/Commands/DeleteAppointment/DeleteAppointmentCommandHandler.cs
        public async Task<Result> Handle(DeleteAppointmentCommand request, CancellationToken cancellationToken)
        {
            // 1. Get the appointment with related entities
            var appointment = await _appointmentRepository.GetByIdAsync(request.Id);
            if (appointment == null)
            {
                throw new NotFoundException(nameof(Appointment), request.Id);
            }

            // 2. Tenant security check
            if (appointment.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            // 3. Check if appointment can be deleted
            if (appointment.Status == Domain.Common.Enums.AppointmentStatus.Completed)
            {
                return Result.Failure("Cannot delete a completed appointment");
            }

            // Store IDs for cache invalidation
            var employeeId = appointment.EmployeeId;
            var customerId = appointment.CustomerId;

            // 4. Delete the appointment
            await _appointmentRepository.DeleteAsync(appointment);

            // 5. Save changes
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 6. Manually invalidate specific caches that couldn't be captured in the command
            await _cacheService.RemoveByPatternAsync($"employee_appointments_{employeeId}");
            await _cacheService.RemoveByPatternAsync($"customer_appointments_{customerId}");

            return Result.Success();
        }
    }
}