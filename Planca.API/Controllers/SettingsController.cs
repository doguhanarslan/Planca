using Microsoft.AspNetCore.Mvc;
using Planca.Application.Features.Settings.Queries.GetSettings;
using Planca.Application.Features.Settings.Queries.GetBusinessSettings;
using Planca.Application.Features.Settings.Queries.GetBookingSettings;
using Planca.Application.Features.Settings.Queries.GetNotificationSettings;
using Planca.Application.Features.Settings.Commands.UpdateSettings;
using Planca.Application.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace Planca.API.Controllers
{
    /// <summary>
    /// Settings management controller
    /// </summary>
    [Authorize]
    public class SettingsController : BaseApiController
    {
        /// <summary>
        /// Get all settings grouped by category
        /// </summary>
        /// <param name="category">Optional category filter</param>
        /// <param name="includeInactive">Include inactive settings</param>
        /// <param name="includeSystemSettings">Include system settings</param>
        /// <returns>Settings grouped by category</returns>
        [HttpGet]
        public async Task<ActionResult<List<SettingsCategoryDto>>> GetSettings(
            [FromQuery] string? category = null,
            [FromQuery] bool includeInactive = false,
            [FromQuery] bool includeSystemSettings = false)
        {
            var query = new GetSettingsQuery
            {
                Category = category,
                IncludeInactive = includeInactive,
                IncludeSystemSettings = includeSystemSettings
            };

            var result = await Mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Get business settings
        /// </summary>
        /// <returns>Business settings</returns>
        [HttpGet("business")]
        public async Task<ActionResult<BusinessSettingsDto>> GetBusinessSettings()
        {
            var query = new GetBusinessSettingsQuery();
            var result = await Mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Get booking settings
        /// </summary>
        /// <returns>Booking settings</returns>
        [HttpGet("booking")]
        public async Task<ActionResult<BookingSettingsDto>> GetBookingSettings()
        {
            var query = new GetBookingSettingsQuery();
            var result = await Mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Get notification settings
        /// </summary>
        /// <returns>Notification settings</returns>
        [HttpGet("notifications")]
        public async Task<ActionResult<NotificationSettingsDto>> GetNotificationSettings()
        {
            var query = new GetNotificationSettingsQuery();
            var result = await Mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Update multiple settings
        /// </summary>
        /// <param name="command">Settings update command</param>
        /// <returns>Updated settings</returns>
        [HttpPut]
        public async Task<ActionResult<List<SettingDto>>> UpdateSettings([FromBody] UpdateSettingsCommand command)
        {
            var result = await Mediator.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Update business settings
        /// </summary>
        /// <param name="businessSettings">Business settings to update</param>
        /// <returns>Updated settings</returns>
        [HttpPut("business")]
        public async Task<ActionResult<List<SettingDto>>> UpdateBusinessSettings([FromBody] BusinessSettingsDto businessSettings)
        {
            var settings = new List<SettingItemDto>
            {
                new() { Key = "business_name", Value = businessSettings.BusinessName, Category = "Business", Description = "Business name" },
                new() { Key = "business_description", Value = businessSettings.BusinessDescription, Category = "Business", Description = "Business description" },
                new() { Key = "contact_email", Value = businessSettings.ContactEmail, Category = "Business", Description = "Contact email" },
                new() { Key = "contact_phone", Value = businessSettings.ContactPhone, Category = "Business", Description = "Contact phone" },
                new() { Key = "website", Value = businessSettings.Website, Category = "Business", Description = "Website URL" },
                new() { Key = "address", Value = businessSettings.Address, Category = "Business", Description = "Business address" },
                new() { Key = "timezone", Value = businessSettings.TimeZone, Category = "Business", Description = "Time zone" },
                new() { Key = "currency", Value = businessSettings.Currency, Category = "Business", Description = "Currency" },
                new() { Key = "language", Value = businessSettings.Language, Category = "Business", Description = "Language" }
            };

            var command = new UpdateSettingsCommand
            {
                Settings = settings,
                Category = "Business"
            };

            var result = await Mediator.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Update booking settings
        /// </summary>
        /// <param name="bookingSettings">Booking settings to update</param>
        /// <returns>Updated settings</returns>
        [HttpPut("booking")]
        public async Task<ActionResult<List<SettingDto>>> UpdateBookingSettings([FromBody] BookingSettingsDto bookingSettings)
        {
            var settings = new List<SettingItemDto>
            {
                new() { Key = "max_advance_booking_days", Value = bookingSettings.MaxAdvanceBookingDays.ToString(), Category = "Booking", Description = "Maximum advance booking days", DataType = "int" },
                new() { Key = "min_advance_booking_hours", Value = bookingSettings.MinAdvanceBookingHours.ToString(), Category = "Booking", Description = "Minimum advance booking hours", DataType = "int" },
                new() { Key = "max_cancellation_hours", Value = bookingSettings.MaxCancellationHours.ToString(), Category = "Booking", Description = "Maximum cancellation hours", DataType = "int" },
                new() { Key = "require_customer_phone", Value = bookingSettings.RequireCustomerPhone.ToString(), Category = "Booking", Description = "Require customer phone", DataType = "bool" },
                new() { Key = "require_customer_email", Value = bookingSettings.RequireCustomerEmail.ToString(), Category = "Booking", Description = "Require customer email", DataType = "bool" },
                new() { Key = "allow_online_booking", Value = bookingSettings.AllowOnlineBooking.ToString(), Category = "Booking", Description = "Allow online booking", DataType = "bool" },
                new() { Key = "auto_confirm_bookings", Value = bookingSettings.AutoConfirmBookings.ToString(), Category = "Booking", Description = "Auto confirm bookings", DataType = "bool" },
                new() { Key = "default_appointment_duration", Value = bookingSettings.DefaultAppointmentDuration.ToString(), Category = "Booking", Description = "Default appointment duration (minutes)", DataType = "int" },
                new() { Key = "allow_back_to_back_bookings", Value = bookingSettings.AllowBackToBackBookings.ToString(), Category = "Booking", Description = "Allow back-to-back bookings", DataType = "bool" },
                new() { Key = "buffer_time_between_appointments", Value = bookingSettings.BufferTimeBetweenAppointments.ToString(), Category = "Booking", Description = "Buffer time between appointments (minutes)", DataType = "int" }
            };

            var command = new UpdateSettingsCommand
            {
                Settings = settings,
                Category = "Booking"
            };

            var result = await Mediator.Send(command);
            return Ok(result);
        }

        /// <summary>
        /// Update notification settings
        /// </summary>
        /// <param name="notificationSettings">Notification settings to update</param>
        /// <returns>Updated settings</returns>
        [HttpPut("notifications")]
        public async Task<ActionResult<List<SettingDto>>> UpdateNotificationSettings([FromBody] NotificationSettingsDto notificationSettings)
        {
            var settings = new List<SettingItemDto>
            {
                new() { Key = "email_notifications_enabled", Value = notificationSettings.EmailNotificationsEnabled.ToString(), Category = "Notification", Description = "Email notifications enabled", DataType = "bool" },
                new() { Key = "sms_notifications_enabled", Value = notificationSettings.SmsNotificationsEnabled.ToString(), Category = "Notification", Description = "SMS notifications enabled", DataType = "bool" },
                new() { Key = "send_booking_confirmation", Value = notificationSettings.SendBookingConfirmation.ToString(), Category = "Notification", Description = "Send booking confirmation", DataType = "bool" },
                new() { Key = "send_booking_reminder", Value = notificationSettings.SendBookingReminder.ToString(), Category = "Notification", Description = "Send booking reminder", DataType = "bool" },
                new() { Key = "send_cancellation_notification", Value = notificationSettings.SendCancellationNotification.ToString(), Category = "Notification", Description = "Send cancellation notification", DataType = "bool" },
                new() { Key = "reminder_hours_before_appointment", Value = notificationSettings.ReminderHoursBeforeAppointment.ToString(), Category = "Notification", Description = "Reminder hours before appointment", DataType = "int" },
                new() { Key = "notify_employee_on_new_booking", Value = notificationSettings.NotifyEmployeeOnNewBooking.ToString(), Category = "Notification", Description = "Notify employee on new booking", DataType = "bool" },
                new() { Key = "notify_admin_on_cancellation", Value = notificationSettings.NotifyAdminOnCancellation.ToString(), Category = "Notification", Description = "Notify admin on cancellation", DataType = "bool" }
            };

            var command = new UpdateSettingsCommand
            {
                Settings = settings,
                Category = "Notification"
            };

            var result = await Mediator.Send(command);
            return Ok(result);
        }
    }
} 