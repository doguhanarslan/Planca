// Planca.Application/Features/Notifications/Handlers/AppointmentReminderNotificationHandler.cs
using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Interfaces;
using Planca.Application.DTOs;
using Planca.Application.Features.Notifications.Events;

namespace Planca.Application.Features.Notifications.Handlers
{
    /// <summary>
    /// Randevu hatırlatma bildirimi handler'ı.
    /// Hangfire job tarafından tetiklenir ve müşteriye hatırlatma mesajı gönderir.
    /// </summary>
    public class AppointmentReminderNotificationHandler : INotificationHandler<AppointmentReminderNotification>
    {
        private readonly IWhatsAppNotificationService _whatsAppService;
        private readonly ILogger<AppointmentReminderNotificationHandler> _logger;

        public AppointmentReminderNotificationHandler(
            IWhatsAppNotificationService whatsAppService,
            ILogger<AppointmentReminderNotificationHandler> logger)
        {
            _whatsAppService = whatsAppService;
            _logger = logger;
        }

        public async Task Handle(AppointmentReminderNotification notification, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation(
                    "WhatsApp hatırlatma bildirimi işlemi başlatılıyor - Randevu: {AppointmentId}, {Hours} saat önce",
                    notification.AppointmentId, notification.HoursBeforeAppointment);

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
                    ServiceDurationMinutes = notification.ServiceDurationMinutes
                };

                var result = await _whatsAppService.SendAppointmentReminderAsync(messageDto);

                if (result.IsSuccess)
                {
                    _logger.LogInformation(
                        "WhatsApp hatırlatma mesajı gönderildi - Randevu: {AppointmentId}, SID: {MessageSid}",
                        notification.AppointmentId, result.MessageSid);
                }
                else
                {
                    _logger.LogWarning(
                        "WhatsApp hatırlatma mesajı gönderilemedi - Randevu: {AppointmentId}, Hata: {Error}",
                        notification.AppointmentId, result.ErrorMessage);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WhatsApp hatırlatma bildirimi gönderiminde hata - Randevu: {AppointmentId}", notification.AppointmentId);
            }
        }
    }
}
