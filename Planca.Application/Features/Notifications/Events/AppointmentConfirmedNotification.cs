// Planca.Application/Features/Notifications/Events/AppointmentConfirmedNotification.cs
using MediatR;

namespace Planca.Application.Features.Notifications.Events
{
    /// <summary>
    /// Randevu onaylandığında WhatsApp bildirimi tetiklemek için MediatR INotification.
    /// </summary>
    public class AppointmentConfirmedNotification : INotification
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
