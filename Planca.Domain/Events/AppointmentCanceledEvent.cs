// Planca.Domain/Events/AppointmentCanceledEvent.cs
using Planca.Domain.Entities;

namespace Planca.Domain.Events
{
    /// <summary>
    /// Randevu iptal edildiğinde tetiklenen domain event
    /// </summary>
    public class AppointmentCanceledEvent : DomainEvent
    {
        public Appointment Appointment { get; }
        public string Reason { get; }

        public AppointmentCanceledEvent(Appointment appointment, string reason = null)
        {
            Appointment = appointment;
            Reason = reason;
        }
    }
}
