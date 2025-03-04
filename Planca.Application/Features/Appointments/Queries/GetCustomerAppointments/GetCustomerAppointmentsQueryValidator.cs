using FluentValidation;
using Planca.Domain.Common.Enums;
using System;

namespace Planca.Application.Features.Appointments.Queries.GetCustomerAppointments
{
    public class GetCustomerAppointmentsQueryValidator : AbstractValidator<GetCustomerAppointmentsQuery>
    {
        public GetCustomerAppointmentsQueryValidator()
        {
            RuleFor(x => x.CustomerId)
                .NotEmpty().WithMessage("Customer ID is required");

            // StartDate ve EndDate kontrolü - Her ikisi de belirtilmişse EndDate, StartDate'den sonra olmalı
            When(x => x.StartDate.HasValue && x.EndDate.HasValue, () =>
            {
                RuleFor(x => x.EndDate.Value)
                    .GreaterThanOrEqualTo(x => x.StartDate.Value)
                    .WithMessage("End date must be greater than or equal to start date");
            });

            // Status kontrolü (isteğe bağlı)
            When(x => !string.IsNullOrEmpty(x.Status), () =>
            {
                RuleFor(x => x.Status)
                    .Must(status => Enum.TryParse<AppointmentStatus>(status, out _))
                    .WithMessage("Status is not valid. Valid values are: Scheduled, Confirmed, InProgress, Completed, Canceled, NoShow");
            });

            // FutureOnly ve PastOnly aynı anda true olamaz
            RuleFor(x => x)
                .Must(x => !(x.FutureOnly && x.PastOnly))
                .WithMessage("FutureOnly and PastOnly cannot both be true");
        }
    }
}