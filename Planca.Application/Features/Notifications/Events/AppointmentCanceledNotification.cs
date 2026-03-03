// Planca.Application/Features/Notifications/Events/AppointmentCanceledNotification.cs
using MediatR;

namespace Planca.Application.Features.Notifications.Events
{
    /// <summary>
    /// Randevu iptal edildiğinde WhatsApp bildirimi tetiklemek için MediatR INotification.
    /// </summary>
    public class AppointmentCanceledNotification : INotification
    {
        public Guid AppointmentId { get; set; }
        public Guid TenantId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
        public string BusinessName { get; set; } = string.Empty;
        public DateTime AppointmentDateTime { get; set; }
        public string CancellationReason { get; set; }
    }
}
