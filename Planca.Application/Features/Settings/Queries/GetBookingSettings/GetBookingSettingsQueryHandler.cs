using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Domain.Common.Interfaces;

namespace Planca.Application.Features.Settings.Queries.GetBookingSettings
{
    public class GetBookingSettingsQueryHandler : IRequestHandler<GetBookingSettingsQuery, Result<BookingSettingsDto>>
    {
        private readonly ISettingsRepository _settingsRepository;

        public GetBookingSettingsQueryHandler(ISettingsRepository settingsRepository)
        {
            _settingsRepository = settingsRepository;
        }

        public async Task<Result<BookingSettingsDto>> Handle(GetBookingSettingsQuery request, CancellationToken cancellationToken)
        {
            var settings = await _settingsRepository.GetSettingsDictionaryAsync("Booking");

            var bookingSettings = new BookingSettingsDto
            {
                MaxAdvanceBookingDays = int.TryParse(settings.GetValueOrDefault("max_advance_booking_days", "30"), out var maxDays) ? maxDays : 30,
                MinAdvanceBookingHours = int.TryParse(settings.GetValueOrDefault("min_advance_booking_hours", "1"), out var minHours) ? minHours : 1,
                MaxCancellationHours = int.TryParse(settings.GetValueOrDefault("max_cancellation_hours", "24"), out var cancelHours) ? cancelHours : 24,
                RequireCustomerPhone = bool.TryParse(settings.GetValueOrDefault("require_customer_phone", "true"), out var reqPhone) && reqPhone,
                RequireCustomerEmail = bool.TryParse(settings.GetValueOrDefault("require_customer_email", "true"), out var reqEmail) && reqEmail,
                AllowOnlineBooking = bool.TryParse(settings.GetValueOrDefault("allow_online_booking", "true"), out var allowOnline) && allowOnline,
                AutoConfirmBookings = bool.TryParse(settings.GetValueOrDefault("auto_confirm_bookings", "false"), out var autoConfirm) && autoConfirm,
                DefaultAppointmentDuration = int.TryParse(settings.GetValueOrDefault("default_appointment_duration", "60"), out var defaultDuration) ? defaultDuration : 60,
                AllowBackToBackBookings = bool.TryParse(settings.GetValueOrDefault("allow_back_to_back_bookings", "true"), out var backToBack) && backToBack,
                BufferTimeBetweenAppointments = int.TryParse(settings.GetValueOrDefault("buffer_time_between_appointments", "0"), out var bufferTime) ? bufferTime : 0
            };

            return Result<BookingSettingsDto>.Success(bookingSettings);
        }
    }
}