// Planca.Application/Features/Appointments/Commands/ConfirmAppointment/ConfirmAppointmentCommandHandler.cs
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Features.Notifications.Events;
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
        private readonly IServiceRepository _serviceRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMediator _mediator;
        private readonly ILogger<ConfirmAppointmentCommandHandler> _logger;

        public ConfirmAppointmentCommandHandler(
            IAppointmentRepository appointmentRepository,
            IServiceRepository serviceRepository,
            IEmployeeRepository employeeRepository,
            ITenantRepository tenantRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IMediator mediator,
            ILogger<ConfirmAppointmentCommandHandler> logger)
        {
            _appointmentRepository = appointmentRepository;
            _serviceRepository = serviceRepository;
            _employeeRepository = employeeRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _mediator = mediator;
            _logger = logger;
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

            // 9. WhatsApp onay bildirimi gönder (fire-and-forget)
            _ = Task.Run(async () =>
            {
                try
                {
                    var service = await _serviceRepository.GetByIdAsync(appointment.ServiceId);
                    var employee = await _employeeRepository.GetByIdAsync(appointment.EmployeeId);
                    var tenant = await _tenantRepository.GetByIdAsync(appointment.TenantId);

                    await _mediator.Publish(new AppointmentConfirmedNotification
                    {
                        AppointmentId = appointment.Id,
                        TenantId = appointment.TenantId,
                        CustomerName = appointment.CustomerName,
                        CustomerPhone = appointment.CustomerPhone,
                        ServiceName = service?.Name ?? "Belirtilmemiş",
                        EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : "Belirtilmemiş",
                        BusinessName = tenant?.Name ?? "İşletme",
                        AppointmentDateTime = appointment.StartTime,
                        AppointmentEndTime = appointment.EndTime,
                        ServiceDurationMinutes = service?.DurationMinutes ?? 0,
                        ServicePrice = service?.Price
                    }, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Randevu {AppointmentId} onay bildirimi gönderilemedi", appointment.Id);
                }
            }, cancellationToken);

            // 10. Return DTO
            return Result<AppointmentDto>.Success(_mapper.Map<AppointmentDto>(appointment));
        }
    }
}
