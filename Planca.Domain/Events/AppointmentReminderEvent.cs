// Planca.Domain/Events/AppointmentReminderEvent.cs
using Planca.Domain.Entities;

namespace Planca.Domain.Events
{
    /// <summary>
    /// Randevu hatırlatma zamanı geldiğinde tetiklenen domain event
    /// </summary>
    public class AppointmentReminderEvent : DomainEvent
    {
        public Appointment Appointment { get; }
        public int HoursBeforeAppointment { get; }

        public AppointmentReminderEvent(Appointment appointment, int hoursBeforeAppointment)
        {
            Appointment = appointment;
            HoursBeforeAppointment = hoursBeforeAppointment;
        }
    }
}
