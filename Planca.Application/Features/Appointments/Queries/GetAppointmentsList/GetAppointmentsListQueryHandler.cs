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
        private readonly IMapper _mapper;

        public GetAppointmentsListQueryHandler(
            IAppointmentRepository appointmentRepository,
            IMapper mapper)
        {
            _appointmentRepository = appointmentRepository;
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

            // Sayfalanmış listeyi döndür
            return new PaginatedList<AppointmentDto>(
                appointmentDtos,
                totalAppointments,
                request.PageNumber,
                request.PageSize);
        }
    }
}