using AutoMapper;
using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Enums;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Planca.Domain.Specifications;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Appointments.Queries.GetAppointmentsList
{
    public class GetAppointmentsListQueryHandler : IRequestHandler<GetAppointmentsListQuery, PaginatedList<AppointmentDto>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IMapper _mapper;

        public GetAppointmentsListQueryHandler(
            IAppointmentRepository appointmentRepository,
            ICustomerRepository customerRepository,
            IEmployeeRepository employeeRepository,
            IServiceRepository serviceRepository,
            IMapper mapper)
        {
            _appointmentRepository = appointmentRepository;
            _customerRepository = customerRepository;
            _employeeRepository = employeeRepository;
            _serviceRepository = serviceRepository;
            _mapper = mapper;
        }

        public async Task<PaginatedList<AppointmentDto>> Handle(GetAppointmentsListQuery request, CancellationToken cancellationToken)
        {
            // Specification oluştur - filtreleme, sıralama ve sayfalama için
            var specification = new AppointmentsFilterPagingSpecification(
                request.StartDate,
                request.EndDate,
                request.EmployeeId,
                request.CustomerId,
                request.ServiceId,
                request.Status != null ? Enum.Parse<AppointmentStatus>(request.Status) : null,
                request.SortBy,
                request.SortAscending,
                request.PageSize,
                (request.PageNumber - 1) * request.PageSize
            );

            // Randevuları getir
            var appointments = await _appointmentRepository.ListAsync(specification);

            // Toplam sayıyı bul (sayfalama olmadan)
            var countSpecification = new AppointmentsFilterSpecification(
                request.StartDate,
                request.EndDate,
                request.EmployeeId,
                request.CustomerId,
                request.ServiceId,
                request.Status != null ? Enum.Parse<AppointmentStatus>(request.Status) : null
            );
            var totalAppointments = await _appointmentRepository.CountAsync(countSpecification);

            // Domain entity'leri DTO'lara dönüştür
            var appointmentDtos = _mapper.Map<List<AppointmentDto>>(appointments);

            // İlişkili verileri verimli bir şekilde getir
            if (appointmentDtos.Count > 0)
            {
                // 1. Benzersiz ID'leri çıkar
                var customerIds = appointmentDtos
                    .Where(a => a.CustomerId.HasValue)  // Null olanları filtrele
                    .Select(a => a.CustomerId.Value)    // Nullable'dan Value'ya çevir
                    .Distinct()
                    .ToList();
                var employeeIds = appointmentDtos.Select(a => a.EmployeeId).Distinct().ToList();
                var serviceIds = appointmentDtos.Select(a => a.ServiceId).Distinct().ToList();

                // 2. Gerekli verileri tek seferde getir
                var customers = customerIds.Count > 0
                    ? (await _customerRepository.GetByIdsAsync(customerIds)).ToDictionary(c => c.Id)
                    : new Dictionary<Guid, Customer>();
                var employees = (await _employeeRepository.GetByIdsAsync(employeeIds))
                    .ToDictionary(e => e.Id);
                var services = (await _serviceRepository.GetByIdsAsync(serviceIds))
                    .ToDictionary(s => s.Id);

                // 3. DTO'ları doldur
                foreach (var dto in appointmentDtos)
                {
                    // Customer bilgilerini doldur - Guest ve Registered customer ayrımı
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

                    // Employee bilgilerini doldur
                    if (employees.TryGetValue(dto.EmployeeId, out var employee))
                    {
                        dto.EmployeeName = $"{employee.FirstName} {employee.LastName}";
                    }

                    // Service bilgilerini doldur
                    if (services.TryGetValue(dto.ServiceId, out var service))
                    {
                        dto.ServiceName = service.Name;
                        dto.ServicePrice = service.Price;
                        dto.ServiceDuration = service.DurationMinutes;
                    }
                }
            }

            // Sayfalanmış listeyi döndür
            return new PaginatedList<AppointmentDto>(
                appointmentDtos,
                totalAppointments,
                request.PageNumber,
                request.PageSize);
        }
    }
}