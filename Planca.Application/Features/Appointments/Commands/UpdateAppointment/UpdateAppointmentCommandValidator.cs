using FluentValidation;
using Planca.Domain.Common.Enums;
using System;

namespace Planca.Application.Features.Appointments.Commands.UpdateAppointment
{
    public class UpdateAppointmentCommandValidator : AbstractValidator<UpdateAppointmentCommand>
    {
        public UpdateAppointmentCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Appointment ID is required");

            RuleFor(x => x.CustomerId)
                .NotEmpty().WithMessage("Customer is required");

            RuleFor(x => x.EmployeeId)
                .NotEmpty().WithMessage("Employee is required");

            RuleFor(x => x.ServiceId)
                .NotEmpty().WithMessage("Service is required");

            RuleFor(x => x.StartTime)
                .NotEmpty().WithMessage("Start time is required");

            // Status değeri boş olmayabilir, ancak geçerliyse AppointmentStatus enum'ında bir değer olmalı
            When(x => !string.IsNullOrEmpty(x.Status), () =>
            {
                RuleFor(x => x.Status)
                    .Must(status => Enum.TryParse<AppointmentStatus>(status, out _))
                    .WithMessage("Status is not valid. Valid values are: Scheduled, Confirmed, InProgress, Completed, Canceled, NoShow");
            });

            RuleFor(x => x.Notes)
                .MaximumLength(500).WithMessage("Notes must not exceed 500 characters");
        }
    }
}