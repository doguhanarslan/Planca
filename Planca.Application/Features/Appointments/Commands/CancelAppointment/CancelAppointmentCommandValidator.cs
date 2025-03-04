using FluentValidation;

namespace Planca.Application.Features.Appointments.Commands.CancelAppointment
{
    public class CancelAppointmentCommandValidator : AbstractValidator<CancelAppointmentCommand>
    {
        public CancelAppointmentCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Appointment ID is required");

            RuleFor(x => x.CancellationReason)
                .MaximumLength(500).WithMessage("Cancellation reason must not exceed 500 characters");

            RuleFor(x => x.CanceledBy)
                .MaximumLength(50).WithMessage("CanceledBy must not exceed 50 characters");
        }
    }
}