// Planca.Domain/Events/AppointmentConfirmedEvent.cs
using Planca.Domain.Entities;

namespace Planca.Domain.Events
{
    /// <summary>
    /// Randevu onaylandığında tetiklenen domain event
    /// </summary>
    public class AppointmentConfirmedEvent : DomainEvent
    {
        public Appointment Appointment { get; }

        public AppointmentConfirmedEvent(Appointment appointment)
        {
            Appointment = appointment;
        }
    }
}
