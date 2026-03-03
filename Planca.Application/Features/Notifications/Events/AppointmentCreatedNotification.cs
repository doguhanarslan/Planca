// Planca.Application/Features/Notifications/Events/AppointmentCreatedNotification.cs
using MediatR;

namespace Planca.Application.Features.Notifications.Events
{
    /// <summary>
    /// Randevu oluşturulduğunda WhatsApp bildirimi tetiklemek için MediatR INotification.
    /// Command Handler'dan publish edilir, NotificationHandler tarafından tüketilir.
    /// </summary>
    public class AppointmentCreatedNotification : INotification
    {
        public Guid AppointmentId { get; set; }
        public Guid TenantId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
        public string BusinessName { get; set; } = string.Empty;
        public DateTime AppointmentDateTime { get; set; }
        public DateTime AppointmentEndTime { get; set; }
        public int ServiceDurationMinutes { get; set; }
        public decimal? ServicePrice { get; set; }
    }
}
