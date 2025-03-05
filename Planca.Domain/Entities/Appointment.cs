using System;
using Planca.Domain.Common;
using Planca.Domain.Common.Enums;
using Planca.Domain.Events;

namespace Planca.Domain.Entities
{
    public class Appointment : BaseEntity
    {
        public Guid CustomerId { get; set; }
        public Guid EmployeeId { get; set; }
        public Guid ServiceId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public AppointmentStatus Status { get; set; }
        public string Notes { get; set; }

        // Navigation properties would be handled at the Infrastructure layer

        // Domain logic
        public bool IsValidAppointment()
        {
            return StartTime < EndTime &&
                   EndTime.Subtract(StartTime).TotalMinutes >= 15 &&
                   StartTime > DateTime.UtcNow;
        }

        public bool CanBeCanceled()
        {
            return Status == AppointmentStatus.Scheduled ||
                   Status == AppointmentStatus.Confirmed;
        }

        public void Cancel(string reason = null)
        {
            if (!CanBeCanceled())
                throw new InvalidOperationException("This appointment cannot be canceled due to its current status.");

            Status = AppointmentStatus.Canceled;
            Notes = string.IsNullOrEmpty(Notes)
                ? $"Cancellation reason: {reason}"
                : $"{Notes}\nCancellation reason: {reason}";

            // Could add domain event
            // DomainEvents.Raise(new AppointmentCanceledEvent(this, reason));
        }

        public void Confirm()
        {
            if (Status != AppointmentStatus.Scheduled)
                throw new InvalidOperationException("Only scheduled appointments can be confirmed.");

            Status = AppointmentStatus.Confirmed;

            // Could add domain event
            // DomainEvents.Raise(new AppointmentConfirmedEvent(this));
        }
    }
}