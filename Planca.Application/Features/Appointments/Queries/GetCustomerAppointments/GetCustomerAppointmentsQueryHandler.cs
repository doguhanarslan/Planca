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

namespace Planca.Application.Features.Appointments.Queries.GetCustomerAppointments
{
    public class GetCustomerAppointmentsQueryHandler : IRequestHandler<GetCustomerAppointmentsQuery, Result<List<AppointmentDto>>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IMapper _mapper;

        public GetCustomerAppointmentsQueryHandler(
            IAppointmentRepository appointmentRepository,
            ICustomerRepository customerRepository,
            IMapper mapper)
        {
            _appointmentRepository = appointmentRepository;
            _customerRepository = customerRepository;
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

            return Result<List<AppointmentDto>>.Success(appointmentDtos);
        }
    }
}