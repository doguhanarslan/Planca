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
                // DÜZELTME: CustomerId nullable olduğu için null olanları filtrele
                var customerIds = appointmentDtos
                    .Where(a => a.CustomerId.HasValue) // Null olanları filtrele
                    .Select(a => a.CustomerId.Value)   // Nullable'dan Value'ya çevir
                    .Distinct()
                    .ToList();

                var serviceIds = appointmentDtos.Select(a => a.ServiceId).Distinct().ToList();

                // 2. Gerekli verileri tek seferde getir
                var customers = customerIds.Count > 0
                    ? (await _customerRepository.GetByIdsAsync(customerIds)).ToDictionary(c => c.Id)
                    : new Dictionary<Guid, Customer>();

                var services = (await _serviceRepository.GetByIdsAsync(serviceIds))
                    .ToDictionary(s => s.Id);

                // 3. DTO'ları doldur
                foreach (var dto in appointmentDtos)
                {
                    // Personel adını doldur (zaten biliyoruz)
                    dto.EmployeeName = $"{employee.FirstName} {employee.LastName}";

                    // Müşteri adını doldur - Guest ve Registered customer ayrımı
                    if (dto.IsGuestAppointment)
                    {
                        // Guest appointment için bilgiler zaten DTO'da mevcut olmalı
                        dto.CustomerName = $"{dto.GuestFirstName} {dto.GuestLastName}";
                        dto.CustomerEmail = dto.GuestEmail;
                        dto.CustomerPhone = dto.GuestPhoneNumber;
                    }
                    else if (dto.CustomerId.HasValue && customers.TryGetValue(dto.CustomerId.Value, out var customer))
                    {
                        // Registered customer için bilgileri doldur
                        dto.CustomerName = $"{customer.FirstName} {customer.LastName}";
                        dto.CustomerEmail = customer.Email;
                        dto.CustomerPhone = customer.PhoneNumber;
                    }
                    else
                    {
                        // Fallback - customer bulunamadıysa
                        dto.CustomerName = "Bilinmeyen Müşteri";
                        dto.CustomerEmail = "";
                        dto.CustomerPhone = "";
                    }

                    // Hizmet bilgilerini doldur
                    if (services.TryGetValue(dto.ServiceId, out var service))
                    {
                        dto.ServiceName = service.Name;
                        dto.ServicePrice = service.Price;
                        dto.ServiceDuration = service.DurationMinutes;
                    }
                }
            }

            return Result<List<AppointmentDto>>.Success(appointmentDtos);
        }
    }
}