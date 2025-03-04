using FluentValidation;
using Planca.Domain.Common.Enums;
using System;

namespace Planca.Application.Features.Appointments.Queries.GetAppointmentsList
{
    public class GetAppointmentsListQueryValidator : AbstractValidator<GetAppointmentsListQuery>
    {
        public GetAppointmentsListQueryValidator()
        {
            RuleFor(x => x.PageNumber)
                .GreaterThanOrEqualTo(1).WithMessage("PageNumber must be at least 1");

            RuleFor(x => x.PageSize)
                .GreaterThanOrEqualTo(1).WithMessage("PageSize must be at least 1")
                .LessThanOrEqualTo(100).WithMessage("PageSize must not exceed 100");

            RuleFor(x => x.SortBy)
                .Must(sortBy => string.IsNullOrEmpty(sortBy) ||
                      new[] { "StartTime", "EndTime", "Status", "CreatedAt" }.Contains(sortBy))
                .WithMessage("SortBy is invalid. Valid values are: StartTime, EndTime, Status, CreatedAt");

            // StartDate ve EndDate kontrolü
            When(x => x.StartDate.HasValue && x.EndDate.HasValue, () =>
            {
                RuleFor(x => x.EndDate.Value)
                    .GreaterThanOrEqualTo(x => x.StartDate.Value)
                    .WithMessage("EndDate must be greater than or equal to StartDate");
            });

            // Status kontrolü
            When(x => !string.IsNullOrEmpty(x.Status), () =>
            {
                RuleFor(x => x.Status)
                    .Must(status => Enum.TryParse<AppointmentStatus>(status, out _))
                    .WithMessage("Status is not valid. Valid values are: Scheduled, Confirmed, InProgress, Completed, Canceled, NoShow");
            });
        }
    }
}