using FluentValidation;
using System;

namespace Planca.Application.Features.Services.Commands.UpdateService
{
    public class UpdateServiceCommandValidator : AbstractValidator<UpdateServiceCommand>
    {
        public UpdateServiceCommandValidator()
        {
            RuleFor(v => v.Id)
                .NotEmpty().WithMessage("Service ID is required");

            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Name is required")
                .MaximumLength(100).WithMessage("Name must not exceed 100 characters");

            RuleFor(v => v.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

            RuleFor(v => v.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Price must be greater than or equal to 0");

            RuleFor(v => v.DurationMinutes)
                .GreaterThan(0).WithMessage("Duration must be greater than 0 minutes")
                .LessThanOrEqualTo(480).WithMessage("Duration must not exceed 8 hours (480 minutes)");

            RuleFor(v => v.Color)
                .NotEmpty().WithMessage("Color is required")
                .Matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                .WithMessage("Color must be a valid hex color code (e.g. #3498db)");
        }
    }
}