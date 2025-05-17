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
        private readonly ICustomerRepository _customerRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IMapper _mapper;

        public GetEmployeeAppointmentsQueryHandler(
            IAppointmentRepository appointmentRepository,
            IEmployeeRepository employeeRepository,
            ICustomerRepository customerRepository,
            IServiceRepository serviceRepository,
            IMapper mapper)
        {
            _appointmentRepository = appointmentRepository;
            _employeeRepository = employeeRepository;
            _customerRepository = customerRepository;
            _serviceRepository = serviceRepository;
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

            // İlişkili verileri verimli bir şekilde getir
            if (appointmentDtos.Count > 0)
            {
                // 1. Benzersiz ID'leri çıkar (çalışan ID'si zaten biliniyor)
                var customerIds = appointmentDtos.Select(a => a.CustomerId).Distinct().ToList();
                var serviceIds = appointmentDtos.Select(a => a.ServiceId).Distinct().ToList();

                // 2. Gerekli verileri tek seferde getir
                var customers = (await _customerRepository.GetByIdsAsync(customerIds))
                    .ToDictionary(c => c.Id);
                var services = (await _serviceRepository.GetByIdsAsync(serviceIds))
                    .ToDictionary(s => s.Id);

                // 3. DTO'ları doldur
                foreach (var dto in appointmentDtos)
                {
                    // Personel adını doldur (zaten biliyoruz)
                    dto.EmployeeName = $"{employee.FirstName} {employee.LastName}";
                    
                    // Müşteri adını doldur
                    if (customers.TryGetValue(dto.CustomerId, out var customer))
                    {
                        dto.CustomerName = $"{customer.FirstName} {customer.LastName}";
                    }
                    
                    // Hizmet adını doldur
                    if (services.TryGetValue(dto.ServiceId, out var service))
                    {
                        dto.ServiceName = service.Name;
                    }
                }
            }

            return Result<List<AppointmentDto>>.Success(appointmentDtos);
        }
    }
}