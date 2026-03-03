// Planca.Infrastructure/Services/Messaging/TwilioWhatsAppNotificationService.cs
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Planca.Application.Common.Interfaces;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;
using Planca.Infrastructure.Configuration;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace Planca.Infrastructure.Services.Messaging
{
    /// <summary>
    /// Twilio WhatsApp Business API kullanarak bildirim gönderen servis.
    /// IWhatsAppNotificationService'in Infrastructure layer implementasyonu.
    /// </summary>
    public class TwilioWhatsAppNotificationService : IWhatsAppNotificationService
    {
        private readonly TwilioSettings _twilioSettings;
        private readonly ISettingsRepository _settingsRepository;
        private readonly ILogger<TwilioWhatsAppNotificationService> _logger;
        private bool _isInitialized;

        public TwilioWhatsAppNotificationService(
            IOptions<TwilioSettings> twilioSettings,
            ISettingsRepository settingsRepository,
            ILogger<TwilioWhatsAppNotificationService> logger)
        {
            _twilioSettings = twilioSettings.Value;
            _settingsRepository = settingsRepository;
            _logger = logger;
        }

        /// <summary>
        /// Twilio client'ı lazy initialize eder
        /// </summary>
        private void EnsureInitialized()
        {
            if (_isInitialized) return;

            if (string.IsNullOrWhiteSpace(_twilioSettings.AccountSid) ||
                string.IsNullOrWhiteSpace(_twilioSettings.AuthToken))
            {
                _logger.LogWarning("Twilio kimlik bilgileri yapılandırılmamış. WhatsApp mesajları gönderilemeyecek.");
                return;
            }

            TwilioClient.Init(_twilioSettings.AccountSid, _twilioSettings.AuthToken);
            _isInitialized = true;
            _logger.LogInformation("Twilio client başarıyla başlatıldı");
        }

        /// <inheritdoc />
        public async Task<bool> IsConfiguredForTenantAsync(Guid tenantId)
        {
            try
            {
                // 1. Global Twilio ayarları yapılandırılmış mı?
                if (!_twilioSettings.IsEnabled)
                {
                    return false;
                }

                if (string.IsNullOrWhiteSpace(_twilioSettings.AccountSid) ||
                    string.IsNullOrWhiteSpace(_twilioSettings.AuthToken) ||
                    string.IsNullOrWhiteSpace(_twilioSettings.FromWhatsAppNumber))
                {
                    return false;
                }

                // 2. Tenant bazında WhatsApp bildirimleri aktif mi?
                var tenantWhatsAppSetting = await _settingsRepository.GetByKeyAsync("whatsapp_notifications_enabled");
                if (tenantWhatsAppSetting != null && tenantWhatsAppSetting.Value.ToLower() == "false")
                {
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Tenant {TenantId} için WhatsApp yapılandırma kontrolünde hata", tenantId);
                return false;
            }
        }

        /// <inheritdoc />
        public async Task<WhatsAppMessageResult> SendAppointmentConfirmationAsync(WhatsAppAppointmentMessageDto messageDto)
        {
            var messageBody = FormatTemplate(_twilioSettings.AppointmentConfirmationTemplate, messageDto);
            return await SendWhatsAppMessageAsync(messageDto.CustomerPhoneNumber, messageBody, "Randevu Onayı", messageDto.AppointmentId);
        }

        /// <inheritdoc />
        public async Task<WhatsAppMessageResult> SendAppointmentReminderAsync(WhatsAppAppointmentMessageDto messageDto)
        {
            var messageBody = FormatTemplate(_twilioSettings.AppointmentReminderTemplate, messageDto);
            return await SendWhatsAppMessageAsync(messageDto.CustomerPhoneNumber, messageBody, "Randevu Hatırlatma", messageDto.AppointmentId);
        }

        /// <inheritdoc />
        public async Task<WhatsAppMessageResult> SendAppointmentCancellationAsync(WhatsAppAppointmentMessageDto messageDto, string reason = null)
        {
            var template = _twilioSettings.AppointmentCancellationTemplate;

            // İptal nedeni varsa ekle, yoksa satırı temizle
            var cancellationReason = !string.IsNullOrWhiteSpace(reason)
                ? $"📝 İptal Nedeni: {reason}"
                : "";

            var messageBody = FormatTemplate(template, messageDto)
                .Replace("{CancellationReason}", cancellationReason);

            return await SendWhatsAppMessageAsync(messageDto.CustomerPhoneNumber, messageBody, "Randevu İptali", messageDto.AppointmentId);
        }

        /// <summary>
        /// Twilio API üzerinden WhatsApp mesajı gönderir
        /// </summary>
        private async Task<WhatsAppMessageResult> SendWhatsAppMessageAsync(
            string toPhoneNumber, string messageBody, string messageType, Guid appointmentId)
        {
            try
            {
                EnsureInitialized();

                if (!_isInitialized)
                {
                    return WhatsAppMessageResult.Failure("Twilio client başlatılamadı - kimlik bilgileri eksik");
                }

                // Telefon numarasını WhatsApp formatına dönüştür
                var formattedNumber = FormatPhoneNumber(toPhoneNumber);

                _logger.LogInformation(
                    "WhatsApp mesajı gönderiliyor - Tip: {MessageType}, Randevu: {AppointmentId}, Numara: {PhoneNumber}",
                    messageType, appointmentId, MaskPhoneNumber(formattedNumber));

                var message = await MessageResource.CreateAsync(
                    to: new PhoneNumber($"whatsapp:{formattedNumber}"),
                    from: new PhoneNumber(_twilioSettings.FromWhatsAppNumber),
                    body: messageBody
                );

                _logger.LogInformation(
                    "WhatsApp mesajı başarıyla gönderildi - SID: {MessageSid}, Durum: {Status}",
                    message.Sid, message.Status);

                return WhatsAppMessageResult.Success(message.Sid);
            }
            catch (Twilio.Exceptions.ApiException twilioEx)
            {
                _logger.LogError(twilioEx,
                    "Twilio API hatası - Kod: {ErrorCode}, Mesaj: {ErrorMessage}, Randevu: {AppointmentId}",
                    twilioEx.Code, twilioEx.Message, appointmentId);

                return WhatsAppMessageResult.Failure(
                    $"Twilio API hatası: {twilioEx.Message}",
                    twilioEx.Code.ToString());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "WhatsApp mesaj gönderiminde beklenmeyen hata - Tip: {MessageType}, Randevu: {AppointmentId}",
                    messageType, appointmentId);

                return WhatsAppMessageResult.Failure($"Beklenmeyen hata: {ex.Message}");
            }
        }

        /// <summary>
        /// Mesaj şablonunu randevu bilgileriyle doldurur
        /// </summary>
        private string FormatTemplate(string template, WhatsAppAppointmentMessageDto dto)
        {
            var dateTimeFormatted = dto.AppointmentDateTime.ToString("dd MMMM yyyy, dddd HH:mm",
                new System.Globalization.CultureInfo("tr-TR"));

            var priceFormatted = dto.ServicePrice.HasValue
                ? $"{dto.ServicePrice.Value:N2} ₺"
                : "Belirtilmemiş";

            return template
                .Replace("{CustomerName}", dto.CustomerName)
                .Replace("{ServiceName}", dto.ServiceName)
                .Replace("{EmployeeName}", dto.EmployeeName)
                .Replace("{DateTime}", dateTimeFormatted)
                .Replace("{BusinessName}", dto.BusinessName)
                .Replace("{Duration}", dto.ServiceDurationMinutes.ToString())
                .Replace("{Price}", priceFormatted);
        }

        /// <summary>
        /// Telefon numarasını uluslararası formata dönüştürür
        /// Giriş: 05551234567, +905551234567, 905551234567
        /// Çıkış: +905551234567
        /// </summary>
        private string FormatPhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber))
                return phoneNumber;

            // Boşluk, tire, parantez temizle
            var cleaned = phoneNumber.Trim()
                .Replace(" ", "")
                .Replace("-", "")
                .Replace("(", "")
                .Replace(")", "");

            // Zaten + ile başlıyorsa olduğu gibi döndür
            if (cleaned.StartsWith("+"))
                return cleaned;

            // 0 ile başlıyorsa Türkiye formatı (05xx → +905xx)
            if (cleaned.StartsWith("0") && cleaned.Length == 11)
                return $"+9{cleaned}";

            // 9 ile başlıyorsa ve 12 hane ise (905xx → +905xx)
            if (cleaned.StartsWith("9") && cleaned.Length == 12)
                return $"+{cleaned}";

            // 5 ile başlıyorsa (5xx → +905xx)
            if (cleaned.StartsWith("5") && cleaned.Length == 10)
                return $"+90{cleaned}";

            // Diğer durumlarda + ekle
            return $"+{cleaned}";
        }

        /// <summary>
        /// Log'larda telefon numarasını maskelemek için
        /// </summary>
        private string MaskPhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(phoneNumber) || phoneNumber.Length < 7)
                return "***";

            return $"{phoneNumber[..4]}***{phoneNumber[^3..]}";
        }
    }
}
