using Planca.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Planca.Domain.Events
{
    public class AppointmentCreatedEvent : DomainEvent
    {
        public Appointment Appointment { get; }

        public AppointmentCreatedEvent(Appointment appointment)
        {
            Appointment = appointment;
        }
    }
}
