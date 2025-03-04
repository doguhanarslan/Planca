using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Appointments.Queries.GetAppointmentDetail
{
    public class GetAppointmentDetailQueryHandler : IRequestHandler<GetAppointmentDetailQuery, Result<AppointmentDto>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IMapper _mapper;

        public GetAppointmentDetailQueryHandler(
            IAppointmentRepository appointmentRepository,
            IMapper mapper)
        {
            _appointmentRepository = appointmentRepository;
            _mapper = mapper;
        }

        public async Task<Result<AppointmentDto>> Handle(GetAppointmentDetailQuery request, CancellationToken cancellationToken)
        {
            // Repository üzerinden randevuyu getir
            var appointment = await _appointmentRepository.GetByIdAsync(request.Id);

            // Randevu bulunamazsa hata fırlat
            if (appointment == null)
            {
                throw new NotFoundException(nameof(Appointment), request.Id);
            }

            // Tenant güvenlik kontrolü - farklı tenant'lara ait verilere erişimi engelle
            if (appointment.TenantId != request.TenantId)
            {
                throw new ForbiddenAccessException();
            }

            // Randevu entity'sini DTO'ya dönüştür
            var appointmentDto = _mapper.Map<AppointmentDto>(appointment);

            // Sonucu başarılı olarak döndür
            return Result<AppointmentDto>.Success(appointmentDto);
        }
    }
}