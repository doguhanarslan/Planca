// Planca.Application/Features/Notifications/Handlers/AppointmentCreatedNotificationHandler.cs
using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Interfaces;
using Planca.Application.DTOs;
using Planca.Application.Features.Notifications.Events;
using Planca.Domain.Common.Interfaces;

namespace Planca.Application.Features.Notifications.Handlers
{
    /// <summary>
    /// Randevu oluşturma bildirimi handler'ı.
    /// WhatsApp üzerinden müşteriye randevu onay mesajı gönderir.
    /// </summary>
    public class AppointmentCreatedNotificationHandler : INotificationHandler<AppointmentCreatedNotification>
    {
        private readonly IWhatsAppNotificationService _whatsAppService;
        private readonly ISettingsRepository _settingsRepository;
        private readonly ILogger<AppointmentCreatedNotificationHandler> _logger;

        public AppointmentCreatedNotificationHandler(
            IWhatsAppNotificationService whatsAppService,
            ISettingsRepository settingsRepository,
            ILogger<AppointmentCreatedNotificationHandler> logger)
        {
            _whatsAppService = whatsAppService;
            _settingsRepository = settingsRepository;
            _logger = logger;
        }

        public async Task Handle(AppointmentCreatedNotification notification, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation(
                    "WhatsApp bildirim işlemi başlatılıyor - Randevu oluşturma: {AppointmentId}, Müşteri: {CustomerName}",
                    notification.AppointmentId, notification.CustomerName);

                // 1. Tenant için WhatsApp aktif mi kontrol et
                if (!await _whatsAppService.IsConfiguredForTenantAsync(notification.TenantId))
                {
                    _logger.LogInformation(
                        "Tenant {TenantId} için WhatsApp bildirimleri aktif değil, mesaj gönderilmeyecek",
                        notification.TenantId);
                    return;
                }

                // 2. Bildirim ayarlarını kontrol et - booking confirmation aktif mi?
                var whatsAppEnabledSetting = await _settingsRepository.GetByKeyAsync("whatsapp_send_booking_confirmation");
                if (whatsAppEnabledSetting != null && whatsAppEnabledSetting.Value.ToLower() == "false")
                {
                    _logger.LogInformation("WhatsApp randevu onay bildirimi tenant ayarlarında devre dışı");
                    return;
                }

                // 3. Telefon numarası kontrolü
                if (string.IsNullOrWhiteSpace(notification.CustomerPhone))
                {
                    _logger.LogWarning(
                        "Randevu {AppointmentId} için müşteri telefon numarası bulunamadı, WhatsApp mesajı gönderilemedi",
                        notification.AppointmentId);
                    return;
                }

                // 4. Mesaj DTO'sunu hazırla
                var messageDto = new WhatsAppAppointmentMessageDto
                {
                    AppointmentId = notification.AppointmentId,
                    TenantId = notification.TenantId,
                    CustomerPhoneNumber = notification.CustomerPhone,
                    CustomerName = notification.CustomerName,
                    ServiceName = notification.ServiceName,
                    EmployeeName = notification.EmployeeName,
                    BusinessName = notification.BusinessName,
                    AppointmentDateTime = notification.AppointmentDateTime,
                    AppointmentEndTime = notification.AppointmentEndTime,
                    ServiceDurationMinutes = notification.ServiceDurationMinutes,
                    ServicePrice = notification.ServicePrice
                };

                // 5. WhatsApp mesajı gönder
                var result = await _whatsAppService.SendAppointmentConfirmationAsync(messageDto);

                if (result.IsSuccess)
                {
                    _logger.LogInformation(
                        "WhatsApp randevu onay mesajı başarıyla gönderildi - Randevu: {AppointmentId}, SID: {MessageSid}",
                        notification.AppointmentId, result.MessageSid);
                }
                else
                {
                    _logger.LogWarning(
                        "WhatsApp randevu onay mesajı gönderilemedi - Randevu: {AppointmentId}, Hata: {Error}",
                        notification.AppointmentId, result.ErrorMessage);
                }
            }
            catch (Exception ex)
            {
                // WhatsApp hatası randevu oluşturmayı engellememeli - sadece logla
                _logger.LogError(ex,
                    "WhatsApp bildirim gönderiminde beklenmeyen hata - Randevu: {AppointmentId}",
                    notification.AppointmentId);
            }
        }
    }
}
