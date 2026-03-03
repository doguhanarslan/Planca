// Planca.Application/DTOs/WhatsAppDtos.cs
namespace Planca.Application.DTOs
{
    /// <summary>
    /// WhatsApp mesajı göndermek için gereken randevu bilgileri DTO'su
    /// </summary>
    public class WhatsAppAppointmentMessageDto
    {
        /// <summary>
        /// Müşterinin telefon numarası (WhatsApp formatında: +905551234567)
        /// </summary>
        public string CustomerPhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Müşterinin adı
        /// </summary>
        public string CustomerName { get; set; } = string.Empty;

        /// <summary>
        /// Hizmet adı
        /// </summary>
        public string ServiceName { get; set; } = string.Empty;

        /// <summary>
        /// Çalışan adı
        /// </summary>
        public string EmployeeName { get; set; } = string.Empty;

        /// <summary>
        /// Randevu başlangıç zamanı
        /// </summary>
        public DateTime AppointmentDateTime { get; set; }

        /// <summary>
        /// Randevu bitiş zamanı
        /// </summary>
        public DateTime AppointmentEndTime { get; set; }

        /// <summary>
        /// Hizmet süresi (dakika)
        /// </summary>
        public int ServiceDurationMinutes { get; set; }

        /// <summary>
        /// Hizmet ücreti
        /// </summary>
        public decimal? ServicePrice { get; set; }

        /// <summary>
        /// İşletme/Tenant adı
        /// </summary>
        public string BusinessName { get; set; } = string.Empty;

        /// <summary>
        /// Randevu ID'si
        /// </summary>
        public Guid AppointmentId { get; set; }

        /// <summary>
        /// Tenant ID'si
        /// </summary>
        public Guid TenantId { get; set; }
    }

    /// <summary>
    /// WhatsApp mesaj gönderim sonucu
    /// </summary>
    public class WhatsAppMessageResult
    {
        public bool IsSuccess { get; set; }
        public string MessageSid { get; set; }
        public string ErrorMessage { get; set; }
        public string ErrorCode { get; set; }

        public static WhatsAppMessageResult Success(string messageSid)
        {
            return new WhatsAppMessageResult
            {
                IsSuccess = true,
                MessageSid = messageSid
            };
        }

        public static WhatsAppMessageResult Failure(string errorMessage, string errorCode = null)
        {
            return new WhatsAppMessageResult
            {
                IsSuccess = false,
                ErrorMessage = errorMessage,
                ErrorCode = errorCode
            };
        }
    }

    /// <summary>
    /// Tenant bazlı WhatsApp konfigürasyon ayarları
    /// </summary>
    public class WhatsAppSettingsDto
    {
        public bool IsEnabled { get; set; } = false;
        public bool SendBookingConfirmation { get; set; } = true;
        public bool SendBookingReminder { get; set; } = true;
        public bool SendCancellationNotification { get; set; } = true;
        public int ReminderHoursBeforeAppointment { get; set; } = 24;
    }
}
