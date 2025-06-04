using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;

namespace Planca.Application.Features.Settings.Queries.GetNotificationSettings
{
    public class GetNotificationSettingsQueryHandler : IRequestHandler<GetNotificationSettingsQuery, Result<NotificationSettingsDto>>
    {
        private readonly ISettingsRepository _settingsRepository;

        public GetNotificationSettingsQueryHandler(ISettingsRepository settingsRepository)
        {
            _settingsRepository = settingsRepository;
        }

        public async Task<Result<NotificationSettingsDto>> Handle(GetNotificationSettingsQuery request, CancellationToken cancellationToken)
        {
            var settings = await _settingsRepository.GetSettingsDictionaryAsync("Notification");

            var notificationSettings = new NotificationSettingsDto
            {
                EmailNotificationsEnabled = bool.TryParse(settings.GetValueOrDefault("email_notifications_enabled", "true"), out var emailEnabled) && emailEnabled,
                SmsNotificationsEnabled = bool.TryParse(settings.GetValueOrDefault("sms_notifications_enabled", "false"), out var smsEnabled) && smsEnabled,
                SendBookingConfirmation = bool.TryParse(settings.GetValueOrDefault("send_booking_confirmation", "true"), out var bookingConfirm) && bookingConfirm,
                SendBookingReminder = bool.TryParse(settings.GetValueOrDefault("send_booking_reminder", "true"), out var bookingReminder) && bookingReminder,
                SendCancellationNotification = bool.TryParse(settings.GetValueOrDefault("send_cancellation_notification", "true"), out var cancelNotification) && cancelNotification,
                ReminderHoursBeforeAppointment = int.TryParse(settings.GetValueOrDefault("reminder_hours_before_appointment", "24"), out var reminderHours) ? reminderHours : 24,
                NotifyEmployeeOnNewBooking = bool.TryParse(settings.GetValueOrDefault("notify_employee_on_new_booking", "true"), out var notifyEmployee) && notifyEmployee,
                NotifyAdminOnCancellation = bool.TryParse(settings.GetValueOrDefault("notify_admin_on_cancellation", "true"), out var notifyAdmin) && notifyAdmin
            };

            return Result<NotificationSettingsDto>.Success(notificationSettings);
        }
    }
}