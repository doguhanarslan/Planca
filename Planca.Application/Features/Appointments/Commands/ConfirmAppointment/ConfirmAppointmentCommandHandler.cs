using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Enums;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Appointments.Commands.ConfirmAppointment
{
    public class ConfirmAppointmentCommandHandler : IRequestHandler<ConfirmAppointmentCommand, Result<AppointmentDto>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public ConfirmAppointmentCommandHandler(
            IAppointmentRepository appointmentRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _appointmentRepository = appointmentRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<AppointmentDto>> Handle(ConfirmAppointmentCommand request, CancellationToken cancellationToken)
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

            // 3. Check if appointment can be confirmed
            if (appointment.Status != AppointmentStatus.Scheduled)
            {
                return Result<AppointmentDto>.Failure("Only scheduled appointments can be confirmed");
            }

            // 4. Confirm appointment (using domain logic)
            appointment.Confirm();

            // 5. Update notes if provided
            if (!string.IsNullOrEmpty(request.Notes))
            {
                appointment.Notes = string.IsNullOrEmpty(appointment.Notes)
                    ? request.Notes
                    : $"{appointment.Notes}\n{request.Notes}";
            }

            // 6. Add confirmation metadata
            appointment.LastModifiedAt = DateTime.UtcNow;
            appointment.LastModifiedBy = request.ConfirmedBy ?? "System";

            // 7. Update in repository
            await _appointmentRepository.UpdateAsync(appointment);

            // 8. Save changes
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 9. Return DTO
            return Result<AppointmentDto>.Success(_mapper.Map<AppointmentDto>(appointment));
        }
    }
}