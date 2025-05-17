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
        private readonly ICustomerRepository _customerRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IMapper _mapper;

        public GetAppointmentDetailQueryHandler(
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

            // İlişkili verileri paralel olarak getir
            var customerTask = _customerRepository.GetByIdAsync(appointment.CustomerId);
            var employeeTask = _employeeRepository.GetByIdAsync(appointment.EmployeeId);
            var serviceTask = _serviceRepository.GetByIdAsync(appointment.ServiceId);

            // Tüm görevlerin tamamlanmasını bekle
            await Task.WhenAll(customerTask, employeeTask, serviceTask);

            // Sonuçları DTO'ya aktar
            var customer = customerTask.Result;
            var employee = employeeTask.Result;
            var service = serviceTask.Result;

            if (customer != null)
            {
                appointmentDto.CustomerName = $"{customer.FirstName} {customer.LastName}";
            }

            if (employee != null)
            {
                appointmentDto.EmployeeName = $"{employee.FirstName} {employee.LastName}";
            }

            if (service != null)
            {
                appointmentDto.ServiceName = service.Name;
            }

            // Sonucu başarılı olarak döndür
            return Result<AppointmentDto>.Success(appointmentDto);
        }
    }
}