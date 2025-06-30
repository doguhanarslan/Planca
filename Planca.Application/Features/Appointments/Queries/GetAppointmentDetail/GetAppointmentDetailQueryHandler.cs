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
            // DÜZELTME: CustomerId nullable olduğu için kontrol ekle
            Task<Customer> customerTask = null;
            if (!appointment.IsGuestAppointment && appointment.CustomerId.HasValue)
            {
                customerTask = _customerRepository.GetByIdAsync(appointment.CustomerId.Value);
            }

            var employeeTask = _employeeRepository.GetByIdAsync(appointment.EmployeeId);
            var serviceTask = _serviceRepository.GetByIdAsync(appointment.ServiceId);

            // Null olmayan task'leri bekle
            if (customerTask != null)
            {
                await Task.WhenAll(customerTask, employeeTask, serviceTask);
            }
            else
            {
                await Task.WhenAll(employeeTask, serviceTask);
            }

            // Sonuçları DTO'ya aktar
            var customer = customerTask?.Result;
            var employee = employeeTask.Result;
            var service = serviceTask.Result;

            // Customer bilgilerini doldur - Guest ve Registered customer ayrımı
            if (appointment.IsGuestAppointment)
            {
                // Guest appointment için bilgiler appointment entity'sinden gelir
                appointmentDto.CustomerName = $"{appointment.GuestFirstName} {appointment.GuestLastName}";
                appointmentDto.CustomerEmail = appointment.GuestEmail;
                appointmentDto.CustomerPhone = appointment.GuestPhoneNumber;
            }
            else if (customer != null)
            {
                // Registered customer için bilgileri doldur
                appointmentDto.CustomerName = $"{customer.FirstName} {customer.LastName}";
                appointmentDto.CustomerEmail = customer.Email;
                appointmentDto.CustomerPhone = customer.PhoneNumber;
            }
            else
            {
                // Fallback - customer bulunamadıysa
                appointmentDto.CustomerName = "Bilinmeyen Müşteri";
                appointmentDto.CustomerEmail = "";
                appointmentDto.CustomerPhone = "";
            }

            // Employee bilgilerini doldur
            if (employee != null)
            {
                appointmentDto.EmployeeName = $"{employee.FirstName} {employee.LastName}";
            }

            // Service bilgilerini doldur
            if (service != null)
            {
                appointmentDto.ServiceName = service.Name;
                appointmentDto.ServicePrice = service.Price;
                appointmentDto.ServiceDuration = service.DurationMinutes;
            }

            // Sonucu başarılı olarak döndür
            return Result<AppointmentDto>.Success(appointmentDto);
        }
    }
}