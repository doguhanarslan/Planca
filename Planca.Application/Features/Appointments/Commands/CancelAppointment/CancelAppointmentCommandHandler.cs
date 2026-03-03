// Planca.Application/Features/Appointments/Commands/CancelAppointment/CancelAppointmentCommandHandler.cs
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Features.Notifications.Events;
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
        private readonly IServiceRepository _serviceRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;
        private readonly IMediator _mediator;
        private readonly ILogger<CancelAppointmentCommandHandler> _logger;

        public CancelAppointmentCommandHandler(
            IAppointmentRepository appointmentRepository,
            IServiceRepository serviceRepository,
            IEmployeeRepository employeeRepository,
            ITenantRepository tenantRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            ICacheService cacheService,
            IMediator mediator,
            ILogger<CancelAppointmentCommandHandler> logger)
        {
            _appointmentRepository = appointmentRepository;
            _serviceRepository = serviceRepository;
            _employeeRepository = employeeRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
            _mediator = mediator;
            _logger = logger;
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

            // Store IDs for cache invalidation
            var employeeId = appointment.EmployeeId;
            var customerId = appointment.CustomerId;

            // 4. Cancel the appointment (using domain logic)
            appointment.Cancel(request.CancellationReason);

            // 5. Add cancellation metadata
            appointment.LastModifiedAt = DateTime.UtcNow;
            appointment.LastModifiedBy = request.CanceledBy ?? "System";

            // 6. Update in repository
            await _appointmentRepository.UpdateAsync(appointment);

            // 7. Save changes
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 8. Manually invalidate specific caches
            await _cacheService.RemoveByPatternAsync($"employee_appointments_{employeeId}");
            await _cacheService.RemoveByPatternAsync($"customer_appointments_{customerId}");

            // 9. WhatsApp iptal bildirimi gönder (fire-and-forget)
            _ = Task.Run(async () =>
            {
                try
                {
                    var service = await _serviceRepository.GetByIdAsync(appointment.ServiceId);
                    var employee = await _employeeRepository.GetByIdAsync(appointment.EmployeeId);
                    var tenant = await _tenantRepository.GetByIdAsync(appointment.TenantId);

                    await _mediator.Publish(new AppointmentCanceledNotification
                    {
                        AppointmentId = appointment.Id,
                        TenantId = appointment.TenantId,
                        CustomerName = appointment.CustomerName,
                        CustomerPhone = appointment.CustomerPhone,
                        ServiceName = service?.Name ?? "Belirtilmemiş",
                        EmployeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : "Belirtilmemiş",
                        BusinessName = tenant?.Name ?? "İşletme",
                        AppointmentDateTime = appointment.StartTime,
                        CancellationReason = request.CancellationReason
                    }, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Randevu {AppointmentId} iptal bildirimi gönderilemedi", appointment.Id);
                }
            }, cancellationToken);

            // 10. Return DTO
            return Result<AppointmentDto>.Success(_mapper.Map<AppointmentDto>(appointment));
        }
    }
}
