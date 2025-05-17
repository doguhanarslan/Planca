using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
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

namespace Planca.Application.Features.Appointments.Queries.GetCustomerAppointments
{
    public class GetCustomerAppointmentsQueryHandler : IRequestHandler<GetCustomerAppointmentsQuery, Result<List<AppointmentDto>>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IMapper _mapper;

        public GetCustomerAppointmentsQueryHandler(
            IAppointmentRepository appointmentRepository,
            ICustomerRepository customerRepository,
            IServiceRepository serviceRepository,
            IEmployeeRepository employeeRepository,
            IMapper mapper)
        {
            _appointmentRepository = appointmentRepository;
            _customerRepository = customerRepository;
            _serviceRepository = serviceRepository;
            _employeeRepository = employeeRepository;
            _mapper = mapper;
        }

        public async Task<Result<List<AppointmentDto>>> Handle(GetCustomerAppointmentsQuery request, CancellationToken cancellationToken)
        {
            // Müşterinin var olduğunu ve tenant'a ait olduğunu kontrol et
            var customer = await _customerRepository.GetByIdAsync(request.CustomerId);
            if (customer == null)
            {
                Console.WriteLine("Customer değişkeni: " + customer);
                return Result<List<AppointmentDto>>.Failure($"Customer with ID {request.CustomerId} was not found.");
            }

            if (customer.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            // Müşteriye ait randevuları getir
            var appointments = await _appointmentRepository.GetAppointmentsForCustomerAsync(request.CustomerId);

            // Filtreleri uygula
            if (request.StartDate.HasValue)
            {
                appointments = appointments.Where(a => a.StartTime >= request.StartDate.Value).ToList();
            }

            if (request.EndDate.HasValue)
            {
                appointments = appointments.Where(a => a.StartTime <= request.EndDate.Value).ToList();
            }

            if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<AppointmentStatus>(request.Status, out var status))
            {
                appointments = appointments.Where(a => a.Status == status).ToList();
            }

            var now = DateTime.UtcNow;
            if (request.FutureOnly)
            {
                appointments = appointments.Where(a => a.StartTime >= now).ToList();
            }
            else if (request.PastOnly)
            {
                appointments = appointments.Where(a => a.StartTime < now).ToList();
            }

            // Sıralama uygula
            if (request.SortAscending)
            {
                appointments = appointments.OrderBy(a => a.StartTime).ToList();
            }
            else
            {
                appointments = appointments.OrderByDescending(a => a.StartTime).ToList();
            }

            // DTO'ya dönüştür
            var appointmentDtos = _mapper.Map<List<AppointmentDto>>(appointments);

            // İlişkili verileri verimli bir şekilde getir
            if (appointmentDtos.Count > 0)
            {
                // 1. Benzersiz ID'leri çıkar (müşteri ID'si zaten biliniyor)
                var employeeIds = appointmentDtos.Select(a => a.EmployeeId).Distinct().ToList();
                var serviceIds = appointmentDtos.Select(a => a.ServiceId).Distinct().ToList();

                // 2. Gerekli verileri tek seferde getir
                var employees = (await _employeeRepository.GetByIdsAsync(employeeIds))
                    .ToDictionary(e => e.Id);
                var services = (await _serviceRepository.GetByIdsAsync(serviceIds))
                    .ToDictionary(s => s.Id);

                // 3. DTO'ları doldur
                foreach (var dto in appointmentDtos)
                {
                    // Müşteri adını doldur (zaten biliyoruz)
                    dto.CustomerName = $"{customer.FirstName} {customer.LastName}";
                    
                    // Personel adını doldur
                    if (employees.TryGetValue(dto.EmployeeId, out var employee))
                    {
                        dto.EmployeeName = $"{employee.FirstName} {employee.LastName}";
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