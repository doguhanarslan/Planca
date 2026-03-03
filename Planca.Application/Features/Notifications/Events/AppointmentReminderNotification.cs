// Planca.Application/Features/Notifications/Events/AppointmentReminderNotification.cs
using MediatR;

namespace Planca.Application.Features.Notifications.Events
{
    /// <summary>
    /// Randevu hatırlatma zamanı geldiğinde WhatsApp bildirimi tetiklemek için MediatR INotification.
    /// Hangfire background job tarafından publish edilir.
    /// </summary>
    public class AppointmentReminderNotification : INotification
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
        public int HoursBeforeAppointment { get; set; }
    }
}
