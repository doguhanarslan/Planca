using AutoMapper;
using MediatR;
using Planca.Application.Common.Exceptions;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Enums;
using Planca.Domain.Common.Interfaces;
using Planca.Domain.Entities;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Appointments.Commands.CreateGuestAppointment
{
    public class CreateGuestAppointmentCommandHandler : IRequestHandler<CreateGuestAppointmentCommand, Result<AppointmentDto>>
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<CreateGuestAppointmentCommandHandler> _logger;

        public CreateGuestAppointmentCommandHandler(
            IAppointmentRepository appointmentRepository,
            IServiceRepository serviceRepository,
            IEmployeeRepository employeeRepository,
            ITenantRepository tenantRepository,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            ILogger<CreateGuestAppointmentCommandHandler> logger)
        {
            _appointmentRepository = appointmentRepository;
            _serviceRepository = serviceRepository;
            _employeeRepository = employeeRepository;
            _tenantRepository = tenantRepository;
            _mapper = mapper;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<Result<AppointmentDto>> Handle(CreateGuestAppointmentCommand request, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Creating guest appointment for {Email} at {StartTime}",
                    request.GuestEmail, request.StartTime);

                // 1. Tenant doğrulaması
                var tenant = await _tenantRepository.GetByIdAsync(request.TenantId);
                if (tenant == null)
                {
                    return Result<AppointmentDto>.Failure("İşletme bulunamadı.");
                }

                // 2. Service doğrulaması
                var service = await _serviceRepository.GetByIdAsync(request.ServiceId);
                if (service == null || service.TenantId != request.TenantId)
                {
                    return Result<AppointmentDto>.Failure("Hizmet bulunamadı veya bu işletmeye ait değil.");
                }

                // 3. Employee doğrulaması
                var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId);
                if (employee == null || employee.TenantId != request.TenantId)
                {
                    return Result<AppointmentDto>.Failure("Personel bulunamadı veya bu işletmeye ait değil.");
                }

                // 4. Employee'nin bu service'i yapıp yapamadığını kontrol et
                // (Employee-Service ilişkisi varsa kontrol edilecek)

                // 5. Bitiş zamanını hesapla
                var endTime = request.StartTime.AddMinutes(service.DurationMinutes);

                // 6. Zaman dilimi müsaitlik kontrolü
                var isAvailable = await _appointmentRepository.IsTimeSlotAvailableAsync(
                    request.EmployeeId, request.StartTime, endTime);

                if (!isAvailable)
                {
                    return Result<AppointmentDto>.Failure("Seçilen zaman dilimi müsait değil. Lütfen farklı bir zaman seçiniz.");
                }

                // 7. İş saatleri kontrolü (opsiyonel)
                // Business hours validation eklenebilir

                // 8. Aynı email ile aynı gün çok fazla randevu kontrolü (spam protection)
                var todayStart = request.StartTime.Date;
                var todayEnd = todayStart.AddDays(1);
                var todayAppointmentsCount = await _appointmentRepository.CountGuestAppointmentsByEmailAndDateRangeAsync(
                    request.GuestEmail, todayStart, todayEnd);

                if (todayAppointmentsCount >= 3) // Günde max 3 randevu
                {
                    return Result<AppointmentDto>.Failure("Aynı gün içinde en fazla 3 randevu alabilirsiniz.");
                }

                // 9. Guest appointment oluştur
                var appointment = Appointment.CreateGuestAppointment(
                    tenantId: request.TenantId,
                    serviceId: request.ServiceId,
                    employeeId: request.EmployeeId,
                    startTime: request.StartTime,
                    endTime: endTime,
                    guestFirstName: request.GuestFirstName,
                    guestLastName: request.GuestLastName,
                    guestEmail: request.GuestEmail,
                    guestPhoneNumber: request.GuestPhoneNumber,
                    customerMessage: request.CustomerMessage,
                    notes: request.Notes
                );

                // 10. Veritabanına kaydet
                await _appointmentRepository.AddAsync(appointment);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Guest appointment created successfully with ID {AppointmentId}", appointment.Id);

                // 11. Email bildirimleri - Daha sonra eklenecek
                // TODO: Email service implement edildiğinde aktif edilecek
                /*
                _ = Task.Run(async () =>
                {
                    try
                    {
                        // Müşteriye onay emaili
                        await _emailService.SendGuestAppointmentConfirmationEmailAsync(appointment);
                        
                        // İşletmeye bildirim emaili
                        await _emailService.SendNewAppointmentRequestNotificationEmailAsync(appointment, tenant);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send email notifications for appointment {AppointmentId}", appointment.Id);
                    }
                }, cancellationToken);
                */

                _logger.LogInformation("Email notifications will be implemented later for appointment {AppointmentId}", appointment.Id);

                // 12. DTO'ya dönüştür ve döndür
                var appointmentDto = _mapper.Map<AppointmentDto>(appointment);

                // İlişkili verileri manuel olarak doldur
                appointmentDto.ServiceName = service.Name;
                appointmentDto.ServicePrice = service.Price;
                appointmentDto.ServiceDuration = service.DurationMinutes;
                appointmentDto.EmployeeName = $"{employee.FirstName} {employee.LastName}";

                return Result<AppointmentDto>.Success(appointmentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating guest appointment for {Email}", request.GuestEmail);
                return Result<AppointmentDto>.Failure("Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz.");
            }
        }
    }
}