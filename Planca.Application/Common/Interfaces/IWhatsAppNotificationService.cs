// Planca.Application/Common/Interfaces/IWhatsAppNotificationService.cs
using Planca.Application.DTOs;

namespace Planca.Application.Common.Interfaces
{
    /// <summary>
    /// WhatsApp bildirim servisi interface'i.
    /// Infrastructure layer'da Twilio ile implement edilir.
    /// </summary>
    public interface IWhatsAppNotificationService
    {
        /// <summary>
        /// Randevu oluşturulduğunda müşteriye onay mesajı gönderir
        /// </summary>
        Task<WhatsAppMessageResult> SendAppointmentConfirmationAsync(WhatsAppAppointmentMessageDto messageDto);

        /// <summary>
        /// Randevu hatırlatma mesajı gönderir (X saat önce)
        /// </summary>
        Task<WhatsAppMessageResult> SendAppointmentReminderAsync(WhatsAppAppointmentMessageDto messageDto);

        /// <summary>
        /// Randevu iptal bildirim mesajı gönderir
        /// </summary>
        Task<WhatsAppMessageResult> SendAppointmentCancellationAsync(WhatsAppAppointmentMessageDto messageDto, string reason = null);

        /// <summary>
        /// WhatsApp servisi aktif ve konfigüre edilmiş mi kontrol eder
        /// </summary>
        Task<bool> IsConfiguredForTenantAsync(Guid tenantId);
    }
}
