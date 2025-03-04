using FluentValidation;

namespace Planca.Application.Features.Appointments.Commands.ConfirmAppointment
{
    public class ConfirmAppointmentCommandValidator : AbstractValidator<ConfirmAppointmentCommand>
    {
        public ConfirmAppointmentCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Appointment ID is required");

            RuleFor(x => x.Notes)
                .MaximumLength(500).WithMessage("Notes must not exceed 500 characters");

            RuleFor(x => x.ConfirmedBy)
                .MaximumLength(50).WithMessage("ConfirmedBy must not exceed 50 characters");
        }
    }
}