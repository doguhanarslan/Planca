using FluentValidation;


namespace Planca.Application.Features.Appointments.Commands.CreateAppointment
{
    public class CreateAppointmentCommandValidator : AbstractValidator<CreateAppointmentCommand>
    {
        public CreateAppointmentCommandValidator()
        {
            RuleFor(v => v.CustomerId)
                .NotEmpty().WithMessage("Customer is required");

            RuleFor(v => v.EmployeeId)
                .NotEmpty().WithMessage("Employee is required");

            RuleFor(v => v.ServiceId)
                .NotEmpty().WithMessage("Service is required");

            RuleFor(v => v.StartTime)
                .NotEmpty().WithMessage("Start time is required")
                .GreaterThan(DateTime.UtcNow).WithMessage("Appointment must be in the future");
        }
    }
}
