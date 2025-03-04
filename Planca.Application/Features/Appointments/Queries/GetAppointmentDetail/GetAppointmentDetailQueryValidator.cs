using FluentValidation;
using System;

namespace Planca.Application.Features.Appointments.Queries.GetAppointmentDetail
{
    public class GetAppointmentDetailQueryValidator : AbstractValidator<GetAppointmentDetailQuery>
    {
        public GetAppointmentDetailQueryValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Appointment ID is required");
        }
    }
}