using MediatR;
using Planca.Application.Common.Exceptions;
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

        public DeleteAppointmentCommandHandler(
            IAppointmentRepository appointmentRepository,
            IUnitOfWork unitOfWork)
        {
            _appointmentRepository = appointmentRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(DeleteAppointmentCommand request, CancellationToken cancellationToken)
        {
            // 1. Get the appointment
            var appointment = await _appointmentRepository.GetByIdAsync(request.Id);
            if (appointment == null)
            {
                throw new NotFoundException(nameof(Appointment), request.Id);
            }

            // 2. Check tenant access
            if (appointment.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            // 3. Check if appointment can be deleted (e.g., not in the past or already completed)
            if (appointment.Status == Domain.Common.Enums.AppointmentStatus.Completed)
            {
                return Result.Failure("Cannot delete a completed appointment");
            }

            // 4. Delete the appointment
            await _appointmentRepository.DeleteAsync(appointment);

            // 5. Save changes
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
    }
}