// Planca.Application/Features/Notifications/Handlers/AppointmentConfirmedNotificationHandler.cs
using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Interfaces;
using Planca.Application.DTOs;
using Planca.Application.Features.Notifications.Events;
using Planca.Domain.Common.Interfaces;

namespace Planca.Application.Features.Notifications.Handlers
{
    /// <summary>
    /// Randevu onaylama bildirimi handler'ı.
    /// Özellikle guest appointment'lar Pending → Confirmed geçişinde müşteriye bildirim gönderir.
    /// </summary>
    public class AppointmentConfirmedNotificationHandler : INotificationHandler<AppointmentConfirmedNotification>
    {
        private readonly IWhatsAppNotificationService _whatsAppService;
        private readonly ISettingsRepository _settingsRepository;
        private readonly ILogger<AppointmentConfirmedNotificationHandler> _logger;

        public AppointmentConfirmedNotificationHandler(
            IWhatsAppNotificationService whatsAppService,
            ISettingsRepository settingsRepository,
            ILogger<AppointmentConfirmedNotificationHandler> logger)
        {
            _whatsAppService = whatsAppService;
            _settingsRepository = settingsRepository;
            _logger = logger;
        }

        public async Task Handle(AppointmentConfirmedNotification notification, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation(
                    "WhatsApp bildirim işlemi başlatılıyor - Randevu onayı: {AppointmentId}",
                    notification.AppointmentId);

                if (!await _whatsAppService.IsConfiguredForTenantAsync(notification.TenantId))
                {
                    _logger.LogInformation("Tenant {TenantId} için WhatsApp bildirimleri aktif değil", notification.TenantId);
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
                    AppointmentDateTime = notification.AppointmentDateTime,
                    AppointmentEndTime = notification.AppointmentEndTime,
                    ServiceDurationMinutes = notification.ServiceDurationMinutes,
                    ServicePrice = notification.ServicePrice
                };

                var result = await _whatsAppService.SendAppointmentConfirmationAsync(messageDto);

                if (result.IsSuccess)
                {
                    _logger.LogInformation(
                        "WhatsApp randevu onay mesajı gönderildi - Randevu: {AppointmentId}, SID: {MessageSid}",
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
                _logger.LogError(ex, "WhatsApp onay bildirimi gönderiminde hata - Randevu: {AppointmentId}", notification.AppointmentId);
            }
        }
    }
}
