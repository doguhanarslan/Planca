using FluentValidation;
using Planca.Domain.Common.Enums;

namespace Planca.Application.Features.Auth.Commands.Register
{
    public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
    {
        public RegisterCommandValidator()
        {
            RuleFor(v => v.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Email is not valid")
                .MaximumLength(255).WithMessage("Email must not exceed 255 characters");

            RuleFor(v => v.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters")
                .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches("[0-9]").WithMessage("Password must contain at least one digit");

            RuleFor(v => v.ConfirmPassword)
                .Equal(v => v.Password).WithMessage("Passwords do not match");

            RuleFor(v => v.FirstName)
                .NotEmpty().WithMessage("First name is required")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters");

            RuleFor(v => v.LastName)
                .NotEmpty().WithMessage("Last name is required")
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters");

            RuleFor(v => v.PhoneNumber)
                .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters");

            RuleFor(v => v.Role)
                .Must(role => role == UserRoles.Customer || role == UserRoles.Employee || role == UserRoles.Admin)
                .WithMessage("Invalid role. Valid roles are: Customer, Employee, Admin");
        }
    }
}