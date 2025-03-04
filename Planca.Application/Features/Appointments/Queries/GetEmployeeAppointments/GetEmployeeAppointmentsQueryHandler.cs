using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Enums;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Appointments.Queries.GetEmployeeAppointments
{
    public class GetEmployeeAppointmentsQueryHandler : IRequestHandler<GetEmployeeAppointmentsQuery, Result<List<AppointmentDto>>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IMapper _mapper;

        public GetEmployeeAppointmentsQueryHandler(
            IAppointmentRepository appointmentRepository,
            IEmployeeRepository employeeRepository,
            IMapper mapper)
        {
            _appointmentRepository = appointmentRepository;
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        public async Task<Result<List<AppointmentDto>>> Handle(GetEmployeeAppointmentsQuery request, CancellationToken cancellationToken)
        {
            // Çalışanın var olduğunu ve tenant'a ait olduğunu kontrol et
            var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId);
            if (employee == null)
            {
                throw new NotFoundException(nameof(Employee), request.EmployeeId);
            }

            if (employee.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            // Çalışana ait randevuları getir
            var appointments = await _appointmentRepository.GetAppointmentsForEmployeeAsync(
                request.EmployeeId,
                request.StartDate,
                request.EndDate);

            // Durum filtresi varsa uygula
            if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<AppointmentStatus>(request.Status, out var status))
            {
                appointments = appointments.Where(a => a.Status == status).ToList();
            }

            // DTO'ya dönüştür
            var appointmentDtos = _mapper.Map<List<AppointmentDto>>(appointments);

            return Result<List<AppointmentDto>>.Success(appointmentDtos);
        }
    }
}