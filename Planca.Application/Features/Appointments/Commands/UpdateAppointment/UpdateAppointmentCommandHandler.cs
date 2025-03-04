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

namespace Planca.Application.Features.Appointments.Commands.UpdateAppointment
{
    public class UpdateAppointmentCommandHandler : IRequestHandler<UpdateAppointmentCommand, Result<AppointmentDto>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateAppointmentCommandHandler(
            IAppointmentRepository appointmentRepository,
            IServiceRepository serviceRepository,
            IEmployeeRepository employeeRepository,
            ICustomerRepository customerRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork)
        {
            _appointmentRepository = appointmentRepository;
            _serviceRepository = serviceRepository;
            _employeeRepository = employeeRepository;
            _customerRepository = customerRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<AppointmentDto>> Handle(UpdateAppointmentCommand request, CancellationToken cancellationToken)
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

            // 3. Verify related entities exist
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

            var customer = await _customerRepository.GetByIdAsync(request.CustomerId);
            if (customer == null)
            {
                return Result<AppointmentDto>.Failure("Customer not found");
            }

            // 4. Calculate end time based on service duration
            var endTime = request.StartTime.AddMinutes(service.DurationMinutes);

            // 5. Check for overlap with other appointments
            var isTimeSlotAvailable = await _appointmentRepository.IsTimeSlotAvailableAsync(
                request.EmployeeId, request.StartTime, endTime, request.Id);

            if (!isTimeSlotAvailable)
            {
                return Result<AppointmentDto>.Failure("Selected time slot is not available");
            }

            // 6. Update appointment entity
            appointment.CustomerId = request.CustomerId;
            appointment.EmployeeId = request.EmployeeId;
            appointment.ServiceId = request.ServiceId;
            appointment.StartTime = request.StartTime;
            appointment.EndTime = endTime;
            appointment.Notes = request.Notes ?? appointment.Notes;

            // 7. Update status if provided
            if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<AppointmentStatus>(request.Status, out var status))
            {
                appointment.Status = status;
            }

            // 8. Update in repository
            await _appointmentRepository.UpdateAsync(appointment);

            // 9. Save changes
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 10. Return DTO
            return Result<AppointmentDto>.Success(_mapper.Map<AppointmentDto>(appointment));
        }
    }
}