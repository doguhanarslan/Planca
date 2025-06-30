using System;
using Planca.Domain.Common;
using Planca.Domain.Common.Enums;
using Planca.Domain.Events;

namespace Planca.Domain.Entities
{
    public class Appointment : BaseEntity
    {
        // Mevcut alanlar
        public Guid? CustomerId { get; set; } // Nullable yapıldı - guest appointment için
        public Guid EmployeeId { get; set; }
        public Guid ServiceId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public AppointmentStatus Status { get; set; }
        public string Notes { get; set; }

        // YENİ: Guest Customer Alanları
        public bool IsGuestAppointment { get; set; }
        public string GuestFirstName { get; set; }
        public string GuestLastName { get; set; }
        public string GuestEmail { get; set; }
        public string GuestPhoneNumber { get; set; }
        public string CustomerMessage { get; set; }

        // Navigation properties (Infrastructure layer'da handle edilecek)
        public virtual Customer Customer { get; set; }
        public virtual Employee Employee { get; set; }
        public virtual Service Service { get; set; }

        // Computed Properties - Guest veya Registered customer bilgilerini döner
        public string CustomerName
        {
            get
            {
                if (IsGuestAppointment)
                {
                    return $"{GuestFirstName} {GuestLastName}".Trim();
                }

                if (Customer != null)
                {
                    return $"{Customer.FirstName} {Customer.LastName}".Trim();
                }

                return "Unknown Customer";
            }
        }

        public string CustomerEmail
        {
            get
            {
                if (IsGuestAppointment)
                {
                    return GuestEmail ?? "";
                }

                return Customer?.Email ?? "";
            }
        }

        public string CustomerPhone
        {
            get
            {
                if (IsGuestAppointment)
                {
                    return GuestPhoneNumber ?? "";
                }

                return Customer?.PhoneNumber ?? "";
            }
        }

        // Domain Logic Methods
        public bool IsValidAppointment()
        {
            // Basic time validation
            var isTimeValid = StartTime < EndTime &&
                             EndTime.Subtract(StartTime).TotalMinutes >= 15 &&
                             StartTime > DateTime.UtcNow;

            if (!isTimeValid) return false;

            // Customer validation - either registered customer OR guest info must be present
            if (IsGuestAppointment)
            {
                return !string.IsNullOrWhiteSpace(GuestFirstName) &&
                       !string.IsNullOrWhiteSpace(GuestLastName) &&
                       !string.IsNullOrWhiteSpace(GuestEmail) &&
                       !string.IsNullOrWhiteSpace(GuestPhoneNumber);
            }
            else
            {
                return CustomerId.HasValue && CustomerId != Guid.Empty;
            }
        }

        public bool CanBeCanceled()
        {
            return Status == AppointmentStatus.Scheduled ||
                   Status == AppointmentStatus.Confirmed ||
                   Status == AppointmentStatus.Pending; // Guest appointments start as Pending
        }

        public bool CanBeConfirmed()
        {
            return Status == AppointmentStatus.Pending ||
                   Status == AppointmentStatus.Scheduled;
        }

        public void Cancel(string reason = null)
        {
            if (!CanBeCanceled())
                throw new InvalidOperationException("This appointment cannot be canceled due to its current status.");

            Status = AppointmentStatus.Canceled;

            var cancellationNote = $"Canceled at {DateTime.UtcNow:yyyy-MM-dd HH:mm}";
            if (!string.IsNullOrWhiteSpace(reason))
            {
                cancellationNote += $" - Reason: {reason}";
            }

            Notes = string.IsNullOrWhiteSpace(Notes)
                ? cancellationNote
                : $"{Notes}\n{cancellationNote}";

            // Domain event eklenebilir
            // DomainEvents.Raise(new AppointmentCanceledEvent(this, reason));
        }

        public void Confirm()
        {
            if (!CanBeConfirmed())
                throw new InvalidOperationException("Only pending or scheduled appointments can be confirmed.");

            Status = AppointmentStatus.Confirmed;

            var confirmationNote = $"Confirmed at {DateTime.UtcNow:yyyy-MM-dd HH:mm}";
            Notes = string.IsNullOrWhiteSpace(Notes)
                ? confirmationNote
                : $"{Notes}\n{confirmationNote}";

            // Domain event eklenebilir
            // DomainEvents.Raise(new AppointmentConfirmedEvent(this));
        }

        public void Reject(string reason = null)
        {
            if (Status != AppointmentStatus.Pending)
                throw new InvalidOperationException("Only pending appointments can be rejected.");

            Status = AppointmentStatus.Rejected;

            var rejectionNote = $"Rejected at {DateTime.UtcNow:yyyy-MM-dd HH:mm}";
            if (!string.IsNullOrWhiteSpace(reason))
            {
                rejectionNote += $" - Reason: {reason}";
            }

            Notes = string.IsNullOrWhiteSpace(Notes)
                ? rejectionNote
                : $"{Notes}\n{rejectionNote}";

            // Domain event eklenebilir
            // DomainEvents.Raise(new AppointmentRejectedEvent(this, reason));
        }

        // Static factory methods for creating appointments
        public static Appointment CreateGuestAppointment(
            Guid tenantId,
            Guid serviceId,
            Guid employeeId,
            DateTime startTime,
            DateTime endTime,
            string guestFirstName,
            string guestLastName,
            string guestEmail,
            string guestPhoneNumber,
            string customerMessage = null,
            string notes = null)
        {
            var appointment = new Appointment
            {
                TenantId = tenantId,
                ServiceId = serviceId,
                EmployeeId = employeeId,
                StartTime = startTime,
                EndTime = endTime,
                Status = AppointmentStatus.Pending, // Guest appointments start as Pending
                Notes = notes ?? "",

                // Guest specific
                IsGuestAppointment = true,
                GuestFirstName = guestFirstName?.Trim(),
                GuestLastName = guestLastName?.Trim(),
                GuestEmail = guestEmail?.Trim(),
                GuestPhoneNumber = guestPhoneNumber?.Trim(),
                CustomerMessage = customerMessage?.Trim() ?? "",

                // No customer ID for guest appointments
                CustomerId = null
            };

            if (!appointment.IsValidAppointment())
            {
                throw new ArgumentException("Invalid guest appointment data provided.");
            }

            return appointment;
        }

        public static Appointment CreateRegisteredCustomerAppointment(
            Guid tenantId,
            Guid customerId,
            Guid serviceId,
            Guid employeeId,
            DateTime startTime,
            DateTime endTime,
            string notes = null)
        {
            var appointment = new Appointment
            {
                TenantId = tenantId,
                CustomerId = customerId,
                ServiceId = serviceId,
                EmployeeId = employeeId,
                StartTime = startTime,
                EndTime = endTime,
                Status = AppointmentStatus.Scheduled, // Registered customers go directly to Scheduled
                Notes = notes ?? "",

                // Not a guest appointment
                IsGuestAppointment = false
            };

            if (!appointment.IsValidAppointment())
            {
                throw new ArgumentException("Invalid customer appointment data provided.");
            }

            return appointment;
        }
    }
}