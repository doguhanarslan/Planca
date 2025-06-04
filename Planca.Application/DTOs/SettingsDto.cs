using System;
using System.Collections.Generic;

namespace Planca.Application.DTOs
{
    /// <summary>
    /// Setting detail DTO
    /// </summary>
    public class SettingDto
    {
        public Guid Id { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string DataType { get; set; } = "string";
        public bool IsActive { get; set; }
        public bool IsSystemSetting { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastModifiedAt { get; set; }
    }

    /// <summary>
    /// Setting item for lists and updates
    /// </summary>
    public class SettingItemDto
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string DataType { get; set; } = "string";
        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;
    }

    /// <summary>
    /// Settings grouped by category
    /// </summary>
    public class SettingsCategoryDto
    {
        public string Category { get; set; } = string.Empty;
        public List<SettingDto> Settings { get; set; } = new List<SettingDto>();
    }

    /// <summary>
    /// Business settings group
    /// </summary>
    public class BusinessSettingsDto
    {
        public string BusinessName { get; set; } = string.Empty;
        public string BusinessDescription { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string Website { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string TimeZone { get; set; } = "UTC";
        public string Currency { get; set; } = "USD";
        public string Language { get; set; } = "en";
    }

    /// <summary>
    /// Booking settings group
    /// </summary>
    public class BookingSettingsDto
    {
        public int MaxAdvanceBookingDays { get; set; } = 30;
        public int MinAdvanceBookingHours { get; set; } = 1;
        public int MaxCancellationHours { get; set; } = 24;
        public bool RequireCustomerPhone { get; set; } = true;
        public bool RequireCustomerEmail { get; set; } = true;
        public bool AllowOnlineBooking { get; set; } = true;
        public bool AutoConfirmBookings { get; set; } = false;
        public int DefaultAppointmentDuration { get; set; } = 60;
        public bool AllowBackToBackBookings { get; set; } = true;
        public int BufferTimeBetweenAppointments { get; set; } = 0;
    }

    /// <summary>
    /// Notification settings group
    /// </summary>
    public class NotificationSettingsDto
    {
        public bool EmailNotificationsEnabled { get; set; } = true;
        public bool SmsNotificationsEnabled { get; set; } = false;
        public bool SendBookingConfirmation { get; set; } = true;
        public bool SendBookingReminder { get; set; } = true;
        public bool SendCancellationNotification { get; set; } = true;
        public int ReminderHoursBeforeAppointment { get; set; } = 24;
        public bool NotifyEmployeeOnNewBooking { get; set; } = true;
        public bool NotifyAdminOnCancellation { get; set; } = true;
    }
}