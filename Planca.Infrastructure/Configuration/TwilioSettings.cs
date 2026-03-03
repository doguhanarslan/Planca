// Planca.Infrastructure/Configuration/TwilioSettings.cs
namespace Planca.Infrastructure.Configuration
{
    /// <summary>
    /// Twilio WhatsApp API konfigürasyon ayarları.
    /// appsettings.json'dan Options pattern ile okunur.
    /// </summary>
    public class TwilioSettings
    {
        public const string SectionName = "Twilio";

        /// <summary>
        /// Twilio Account SID - Twilio Console'dan alınır
        /// </summary>
        public string AccountSid { get; set; } = string.Empty;

        /// <summary>
        /// Twilio Auth Token - Twilio Console'dan alınır
        /// </summary>
        public string AuthToken { get; set; } = string.Empty;

        /// <summary>
        /// WhatsApp gönderen numara (Twilio formatında: whatsapp:+14155238886)
        /// Sandbox için: whatsapp:+14155238886
        /// Production için: whatsapp:+905XXXXXXXXX (kendi onaylı numaranız)
        /// </summary>
        public string FromWhatsAppNumber { get; set; } = string.Empty;

        /// <summary>
        /// WhatsApp bildirimleri global olarak aktif mi?
        /// </summary>
        public bool IsEnabled { get; set; } = false;

        /// <summary>
        /// Randevu onay mesaj şablonu (Türkçe)
        /// Desteklenen değişkenler: {CustomerName}, {ServiceName}, {EmployeeName}, {DateTime}, {BusinessName}, {Duration}, {Price}
        /// </summary>
        public string AppointmentConfirmationTemplate { get; set; } =
            "Merhaba {CustomerName}, randevunuz oluşturuldu.\n\n" +
            "📋 Hizmet: {ServiceName}\n" +
            "👤 Personel: {EmployeeName}\n" +
            "📅 Tarih: {DateTime}\n" +
            "⏱ Süre: {Duration} dakika\n" +
            "💰 Ücret: {Price}\n\n" +
            "📍 {BusinessName}\n\n" +
            "Randevunuzu iptal etmek veya değiştirmek için lütfen bizimle iletişime geçin.";

        /// <summary>
        /// Randevu hatırlatma mesaj şablonu (Türkçe)
        /// </summary>
        public string AppointmentReminderTemplate { get; set; } =
            "Merhaba {CustomerName}, randevunuzu hatırlatmak isteriz.\n\n" +
            "📋 Hizmet: {ServiceName}\n" +
            "👤 Personel: {EmployeeName}\n" +
            "📅 Tarih: {DateTime}\n" +
            "⏱ Süre: {Duration} dakika\n\n" +
            "📍 {BusinessName}\n\n" +
            "Sizi bekliyoruz! Herhangi bir değişiklik için lütfen bizimle iletişime geçin.";

        /// <summary>
        /// Randevu iptal mesaj şablonu (Türkçe)
        /// </summary>
        public string AppointmentCancellationTemplate { get; set; } =
            "Merhaba {CustomerName}, randevunuz iptal edilmiştir.\n\n" +
            "📋 Hizmet: {ServiceName}\n" +
            "📅 Tarih: {DateTime}\n" +
            "{CancellationReason}\n\n" +
            "📍 {BusinessName}\n\n" +
            "Yeni bir randevu almak için lütfen bizimle iletişime geçin.";
    }
}
