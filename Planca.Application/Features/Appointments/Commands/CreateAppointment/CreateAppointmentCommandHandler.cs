// Planca.Application/Features/Appointments/Commands/CreateAppointment/CreateAppointmentCommandHandler.cs
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Features.Notifications.Events;
using Planca.Domain.Common.Enums;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Application.Features.Appointments.Commands.CreateAppointment
{
    public class CreateAppointmentCommandHandler : IRequestHandler<CreateAppointmentCommand, Result<AppointmentDto>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMediator _mediator;
        private readonly ILogger<CreateAppointmentCommandHandler> _logger;

        public CreateAppointmentCommandHandler(
            IAppointmentRepository appointmentRepository,
            IServiceRepository serviceRepository,
            IEmployeeRepository employeeRepository,
            ICustomerRepository customerRepository,
            ITenantRepository tenantRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            IMediator mediator,
            ILogger<CreateAppointmentCommandHandler> logger)
        {
            _appointmentRepository = appointmentRepository;
            _serviceRepository = serviceRepository;
            _employeeRepository = employeeRepository;
            _customerRepository = customerRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _mediator = mediator;
            _logger = logger;
        }

        public async Task<Result<AppointmentDto>> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
        {
            var service = await _serviceRepository.GetByIdAsync(request.ServiceId);
            if (service == null)
            {
                return Result<AppointmentDto>.Failure("Service not found");
            }

            var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId);
            if (employee == null)
            {
                return Result<AppointmentDto>.Failure("Employee not found");
            }

            // Calculate end time based on service duration
            var endTime = request.StartTime.AddMinutes(service.DurationMinutes);

            // Check employee availability
            var isAvailable = await _appointmentRepository.IsTimeSlotAvailableAsync(
                request.EmployeeId, request.StartTime, endTime);

            if (!isAvailable)
            {
                return Result<AppointmentDto>.Failure("Selected time slot is not available");
            }

            // Create appointment entity
            var appointment = new Appointment
            {
                TenantId = request.TenantId, // Set by TenantBehavior
                CustomerId = request.CustomerId,
                EmployeeId = request.EmployeeId,
                ServiceId = request.ServiceId,
                StartTime = request.StartTime,
                EndTime = endTime,
                Status = AppointmentStatus.Scheduled,
                Notes = request.Notes
            };

            // Add to repository
            await _appointmentRepository.AddAsync(appointment);

            // Save changes via unit of work
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // WhatsApp bildirim gönder (fire-and-forget, hata randevu oluşturmayı engellemez)
            _ = Task.Run(async () =>
            {
                try
                {
                    var customer = await _customerRepository.GetByIdAsync(request.CustomerId);
                    var tenant = await _tenantRepository.GetByIdAsync(request.TenantId);

                    await _mediator.Publish(new AppointmentCreatedNotification
                    {
                        AppointmentId = appointment.Id,
                        TenantId = request.TenantId,
                        CustomerName = customer != null ? $"{customer.FirstName} {customer.LastName}" : "Müşteri",
                        CustomerPhone = customer?.PhoneNumber ?? "",
                        ServiceName = service.Name,
                        EmployeeName = $"{employee.FirstName} {employee.LastName}",
                        BusinessName = tenant?.Name ?? "İşletme",
                        AppointmentDateTime = appointment.StartTime,
                        AppointmentEndTime = appointment.EndTime,
                        ServiceDurationMinutes = service.DurationMinutes,
                        ServicePrice = service.Price
                    }, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Randevu {AppointmentId} için WhatsApp bildirim gönderilemedi", appointment.Id);
                }
            }, cancellationToken);

            // Return DTO
            return Result<AppointmentDto>.Success(_mapper.Map<AppointmentDto>(appointment));
        }
    }
}
