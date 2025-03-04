using FluentValidation;
using Planca.Domain.Common.Enums;
using System;

namespace Planca.Application.Features.Appointments.Queries.GetEmployeeAppointments
{
    public class GetEmployeeAppointmentsQueryValidator : AbstractValidator<GetEmployeeAppointmentsQuery>
    {
        public GetEmployeeAppointmentsQueryValidator()
        {
            RuleFor(x => x.EmployeeId)
                .NotEmpty().WithMessage("Employee ID is required");

            RuleFor(x => x.StartDate)
                .NotEmpty().WithMessage("Start date is required");

            RuleFor(x => x.EndDate)
                .NotEmpty().WithMessage("End date is required")
                .GreaterThanOrEqualTo(x => x.StartDate)
                .WithMessage("End date must be greater than or equal to start date");

            // Maksimum bir aylık aralık kabul edilsin
            RuleFor(x => x.EndDate)
                .LessThanOrEqualTo(x => x.StartDate.AddMonths(1))
                .WithMessage("Date range must not exceed 1 month");

            // Status kontrolü (isteğe bağlı)
            When(x => !string.IsNullOrEmpty(x.Status), () =>
            {
                RuleFor(x => x.Status)
                    .Must(status => Enum.TryParse<AppointmentStatus>(status, out _))
                    .WithMessage("Status is not valid. Valid values are: Scheduled, Confirmed, InProgress, Completed, Canceled, NoShow");
            });
        }
    }
}