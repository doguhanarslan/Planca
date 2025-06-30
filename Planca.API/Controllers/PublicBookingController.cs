using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Features.Appointments.Commands.CreateGuestAppointment;
using Planca.Application.Features.Employees.Queries.GetEmployeesList;
using Planca.Application.Features.Services.Queries.GetServicesList;
using Planca.Domain.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Planca.API.Controllers
{
    [ApiController]
    [Route("api/public/booking")]
    [AllowAnonymous] // Public erişim
    public class PublicBookingController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ITenantRepository _tenantRepository;
        private readonly ILogger<PublicBookingController> _logger;

        public PublicBookingController(
            IMediator mediator,
            ITenantRepository tenantRepository,
            ILogger<PublicBookingController> logger)
        {
            _mediator = mediator;
            _tenantRepository = tenantRepository;
            _logger = logger;
        }

        /// <summary>
        /// İşletme public bilgilerini getir
        /// </summary>
        /// <param name="tenantSlug">İşletme slug'ı (ör: dr-mehmet-klinik)</param>
        [HttpGet("business/{tenantSlug}/info")]
        public async Task<IActionResult> GetBusinessInfo(string tenantSlug)
        {
            try
            {
                // Tenant'ı slug ile bul
                var tenant = await _tenantRepository.GetBySlugAsync(tenantSlug);
                if (tenant == null)
                {
                    return NotFound(new { message = "İşletme bulunamadı." });
                }

                var businessInfo = new BusinessPublicInfoDto
                {
                    Id = tenant.Id,
                    BusinessName = tenant.Name,
                    Description = "Profesyonel hizmet sağlayıcısı", // Geçici sabit değer
                    Address = "",
                    PhoneNumber = "",
                    Email = "",
                    Website = "",
                    WorkingHours = "09:00-17:00"
                };

                return Ok(businessInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting business info for slug: {TenantSlug}", tenantSlug);
                return StatusCode(500, new { message = "Bir hata oluştu." });
            }
        }

        /// <summary>
        /// İşletmenin hizmetlerini getir
        /// </summary>
        [HttpGet("business/{tenantSlug}/services")]
        public async Task<IActionResult> GetBusinessServices(string tenantSlug)
        {
            try
            {
                var tenant = await _tenantRepository.GetBySlugAsync(tenantSlug);
                if (tenant == null)
                {
                    return NotFound(new { message = "İşletme bulunamadı." });
                }

                var query = new GetServicesListQuery
                {
                    TenantId = tenant.Id,
                    PageNumber = 1,
                    PageSize = 100 // Tüm hizmetleri getir
                    // IsActive property'si varsa ekleyin: IsActive = true
                };

                // DÜZELTME: GetServicesListQuery direkt PaginatedList döndürüyor
                var result = await _mediator.Send(query);

                // Result direkt PaginatedList<ServiceDto> ise
                if (result != null && result.Items != null)
                {
                    return Ok(result.Items);
                }

                return BadRequest(new { message = "Hizmetler getirilemedi." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting business services for slug: {TenantSlug}", tenantSlug);
                return StatusCode(500, new { message = "Bir hata oluştu." });
            }
        }

        /// <summary>
        /// İşletmenin personellerini getir (belirli hizmet için filtrelenebilir)
        /// </summary>
        [HttpGet("business/{tenantSlug}/employees")]
        public async Task<IActionResult> GetBusinessEmployees(string tenantSlug, [FromQuery] Guid? serviceId = null)
        {
            try
            {
                var tenant = await _tenantRepository.GetBySlugAsync(tenantSlug);
                if (tenant == null)
                {
                    return NotFound(new { message = "İşletme bulunamadı." });
                }

                var query = new GetEmployeesListQuery
                {
                    TenantId = tenant.Id,
                    PageNumber = 1,
                    PageSize = 100
                    // ServiceId = serviceId // ServiceId property'si varsa ekleyin
                };

                // DÜZELTME: GetEmployeesListQuery de direkt PaginatedList döndürüyor olabilir
                var result = await _mediator.Send(query);

                if (result != null && result.Items != null)
                {
                    return Ok(result.Items);
                }

                return BadRequest(new { message = "Personeller getirilemedi." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting business employees for slug: {TenantSlug}", tenantSlug);
                return StatusCode(500, new { message = "Bir hata oluştu." });
            }
        }

        /// <summary>
        /// Müsait zaman dilimlerini getir
        /// </summary>
        [HttpGet("business/{tenantSlug}/availability")]
        public async Task<IActionResult> GetAvailableTimeSlots(
            string tenantSlug,
            [FromQuery] Guid employeeId,
            [FromQuery] Guid serviceId,
            [FromQuery] DateTime date)
        {
            try
            {
                var tenant = await _tenantRepository.GetBySlugAsync(tenantSlug);
                if (tenant == null)
                {
                    return NotFound(new { message = "İşletme bulunamadı." });
                }

                // TODO: GetAvailableTimeSlotsQuery implement edilecek
                // Şimdilik mock data döndür
                var mockTimeSlots = new List<TimeSlotDto>();
                var startTime = date.Date.AddHours(9); // 09:00'dan başla

                for (int i = 0; i < 16; i++) // 09:00-17:00 arası 30'ar dakika
                {
                    var slot = new TimeSlotDto
                    {
                        StartTime = startTime.AddMinutes(i * 30),
                        EndTime = startTime.AddMinutes((i + 1) * 30),
                        IsAvailable = i % 3 != 0 // Her 3.'sü dolu gibi simüle et
                    };
                    mockTimeSlots.Add(slot);
                }

                return Ok(mockTimeSlots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting availability for slug: {TenantSlug}", tenantSlug);
                return StatusCode(500, new { message = "Bir hata oluştu." });
            }
        }

        /// <summary>
        /// Guest randevu oluştur
        /// </summary>
        [HttpPost("business/{tenantSlug}/appointment")]
        public async Task<IActionResult> CreateGuestAppointment(
            string tenantSlug,
            [FromBody] CreateGuestAppointmentRequest request)
        {
            try
            {
                _logger.LogInformation("Creating guest appointment for {Email} at business {TenantSlug}",
                    request.GuestEmail, tenantSlug);

                // Tenant'ı bul
                var tenant = await _tenantRepository.GetBySlugAsync(tenantSlug);
                if (tenant == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "İşletme bulunamadı."
                    });
                }

                // Command oluştur
                var command = new CreateGuestAppointmentCommand
                {
                    TenantId = tenant.Id,
                    GuestFirstName = request.GuestFirstName,
                    GuestLastName = request.GuestLastName,
                    GuestEmail = request.GuestEmail,
                    GuestPhoneNumber = request.GuestPhoneNumber,
                    CustomerMessage = request.CustomerMessage,
                    ServiceId = request.ServiceId,
                    EmployeeId = request.EmployeeId,
                    StartTime = request.StartTime,
                    Notes = request.Notes
                };

                var result = await _mediator.Send(command);

                if (result.Succeeded)
                {
                    _logger.LogInformation("Guest appointment created successfully with ID {AppointmentId}",
                        result.Data.Id);

                    return Ok(new AppointmentRequestResponseDto
                    {
                        Success = true,
                        Message = "Randevu talebiniz başarıyla alındı. En kısa sürede size dönüş yapılacaktır.",
                        AppointmentId = result.Data.Id,
                        ConfirmationCode = result.Data.Id.ToString("N")[..8].ToUpper() // İlk 8 karakter
                    });
                }

                _logger.LogWarning("Failed to create guest appointment: {Error}", string.Join(", ", result.Errors));
                return BadRequest(new AppointmentRequestResponseDto
                {
                    Success = false,
                    Message = result.Errors?.FirstOrDefault() ?? "Randevu oluşturulamadı."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating guest appointment for {Email} at {TenantSlug}",
                    request?.GuestEmail, tenantSlug);

                return StatusCode(500, new AppointmentRequestResponseDto
                {
                    Success = false,
                    Message = "Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyiniz."
                });
            }
        }

        /// <summary>
        /// Randevu durumunu sorgula (guest customer için) - Şimdilik comment out
        /// </summary>
        /*
        [HttpGet("appointment/{confirmationCode}/status")]
        public async Task<IActionResult> GetAppointmentStatus(
            string confirmationCode,
            [FromQuery] string email)
        {
            // TODO: Bu metod daha sonra implement edilecek
            return Ok(new { message = "Bu özellik henüz aktif değil." });
        }
        */
    }

    // Request DTOs
    public class CreateGuestAppointmentRequest
    {
        public string GuestFirstName { get; set; }
        public string GuestLastName { get; set; }
        public string GuestEmail { get; set; }
        public string GuestPhoneNumber { get; set; }
        public string CustomerMessage { get; set; }
        public Guid ServiceId { get; set; }
        public Guid EmployeeId { get; set; }
        public DateTime StartTime { get; set; }
        public string Notes { get; set; }
    }

    public class TimeSlotDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsAvailable { get; set; }
        public string FormattedTime => StartTime.ToString("HH:mm");
    }
}