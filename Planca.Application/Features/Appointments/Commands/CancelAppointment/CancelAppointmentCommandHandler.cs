﻿using AutoMapper;
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

namespace Planca.Application.Features.Appointments.Commands.CancelAppointment
{
    public class CancelAppointmentCommandHandler : IRequestHandler<CancelAppointmentCommand, Result<AppointmentDto>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public CancelAppointmentCommandHandler(
            IAppointmentRepository appointmentRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _appointmentRepository = appointmentRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<AppointmentDto>> Handle(CancelAppointmentCommand request, CancellationToken cancellationToken)
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

            // 3. Check if the appointment can be canceled
            if (!appointment.CanBeCanceled())
            {
                return Result<AppointmentDto>.Failure("This appointment cannot be canceled due to its current status");
            }

            // 4. Cancel the appointment (using domain logic)
            appointment.Cancel(request.CancellationReason);

            // 5. Add cancellation metadata
            appointment.LastModifiedAt = DateTime.UtcNow;
            appointment.LastModifiedBy = request.CanceledBy ?? "System";

            // 6. Update in repository
            await _appointmentRepository.UpdateAsync(appointment);

            // 7. Save changes
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 8. Return DTO
            return Result<AppointmentDto>.Success(_mapper.Map<AppointmentDto>(appointment));
        }
    }
}