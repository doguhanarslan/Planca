// Planca.Application/Features/Notifications/Handlers/AppointmentCanceledNotificationHandler.cs
using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Interfaces;
using Planca.Application.DTOs;
using Planca.Application.Features.Notifications.Events;
using Planca.Domain.Common.Interfaces;

namespace Planca.Application.Features.Notifications.Handlers
{
    /// <summary>
    /// Randevu iptal bildirimi handler'ı.
    /// Müşteriye randevusunun iptal edildiğini WhatsApp üzerinden bildirir.
    /// </summary>
    public class AppointmentCanceledNotificationHandler : INotificationHandler<AppointmentCanceledNotification>
    {
        private readonly IWhatsAppNotificationService _whatsAppService;
        private readonly ISettingsRepository _settingsRepository;
        private readonly ILogger<AppointmentCanceledNotificationHandler> _logger;

        public AppointmentCanceledNotificationHandler(
            IWhatsAppNotificationService whatsAppService,
            ISettingsRepository settingsRepository,
            ILogger<AppointmentCanceledNotificationHandler> logger)
        {
            _whatsAppService = whatsAppService;
            _settingsRepository = settingsRepository;
            _logger = logger;
        }

        public async Task Handle(AppointmentCanceledNotification notification, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation(
                    "WhatsApp bildirim işlemi başlatılıyor - Randevu iptali: {AppointmentId}",
                    notification.AppointmentId);

                if (!await _whatsAppService.IsConfiguredForTenantAsync(notification.TenantId))
                {
                    _logger.LogInformation("Tenant {TenantId} için WhatsApp bildirimleri aktif değil", notification.TenantId);
                    return;
                }

                // İptal bildirimi ayarını kontrol et
                var cancelSetting = await _settingsRepository.GetByKeyAsync("whatsapp_send_cancellation_notification");
                if (cancelSetting != null && cancelSetting.Value.ToLower() == "false")
                {
                    _logger.LogInformation("WhatsApp iptal bildirimi tenant ayarlarında devre dışı");
                    return;
                }

                if (string.IsNullOrWhiteSpace(notification.CustomerPhone))
                {
                    _logger.LogWarning("Randevu {AppointmentId} için müşteri telefon numarası bulunamadı", notification.AppointmentId);
                    return;
                }

                var messageDto = new WhatsAppAppointmentMessageDto
                {
                    AppointmentId = notification.AppointmentId,
                    TenantId = notification.TenantId,
                    CustomerPhoneNumber = notification.CustomerPhone,
                    CustomerName = notification.CustomerName,
                    ServiceName = notification.ServiceName,
                    EmployeeName = notification.EmployeeName,
                    BusinessName = notification.BusinessName,
                    AppointmentDateTime = notification.AppointmentDateTime
                };

                var result = await _whatsAppService.SendAppointmentCancellationAsync(messageDto, notification.CancellationReason);

                if (result.IsSuccess)
                {
                    _logger.LogInformation(
                        "WhatsApp iptal mesajı gönderildi - Randevu: {AppointmentId}, SID: {MessageSid}",
                        notification.AppointmentId, result.MessageSid);
                }
                else
                {
                    _logger.LogWarning(
                        "WhatsApp iptal mesajı gönderilemedi - Randevu: {AppointmentId}, Hata: {Error}",
                        notification.AppointmentId, result.ErrorMessage);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WhatsApp iptal bildirimi gönderiminde hata - Randevu: {AppointmentId}", notification.AppointmentId);
            }
        }
    }
}
