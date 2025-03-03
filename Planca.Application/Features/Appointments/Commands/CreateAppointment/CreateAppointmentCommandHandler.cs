using AutoMapper;
using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
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
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public CreateAppointmentCommandHandler(
            IAppointmentRepository appointmentRepository,
            IServiceRepository serviceRepository,
            IEmployeeRepository employeeRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _appointmentRepository = appointmentRepository;
            _serviceRepository = serviceRepository;
            _employeeRepository = employeeRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
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

            // Return DTO
            return Result<AppointmentDto>.Success(_mapper.Map<AppointmentDto>(appointment));
        }
    }
}
