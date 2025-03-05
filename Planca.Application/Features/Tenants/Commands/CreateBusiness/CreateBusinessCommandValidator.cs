using FluentValidation;
using System.Text.RegularExpressions;

namespace Planca.Application.Features.Tenants.Commands.CreateBusiness
{
    public class CreateBusinessCommandValidator : AbstractValidator<CreateBusinessCommand>
    {
        public CreateBusinessCommandValidator()
        {
            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Business name is required")
                .MaximumLength(100).WithMessage("Business name must not exceed 100 characters");

            RuleFor(v => v.Subdomain)
                .NotEmpty().WithMessage("Subdomain is required")
                .MaximumLength(50).WithMessage("Subdomain must not exceed 50 characters")
                .Matches(new Regex("^[a-z0-9]+(-[a-z0-9]+)*$"))
                .WithMessage("Subdomain can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen");

            RuleFor(v => v.UserId)
                .NotEmpty().WithMessage("User ID is required");

            RuleFor(v => v.Address)
                .NotEmpty().WithMessage("Address is required")
                .MaximumLength(500).WithMessage("Address must not exceed 500 characters");

            RuleFor(v => v.City)
                .NotEmpty().WithMessage("City is required")
                .MaximumLength(100).WithMessage("City must not exceed 100 characters");

            RuleFor(v => v.State)
                .NotEmpty().WithMessage("State is required")
                .MaximumLength(100).WithMessage("State must not exceed 100 characters");

            RuleFor(v => v.ZipCode)
                .NotEmpty().WithMessage("Zip code is required")
                .MaximumLength(20).WithMessage("Zip code must not exceed 20 characters");

            RuleFor(v => v.WorkSchedule)
                .NotEmpty().WithMessage("Work schedule is required");

            RuleForEach(v => v.WorkSchedule).ChildRules(schedule => {
                schedule.RuleFor(s => s.OpenTime)
                    .LessThan(s => s.CloseTime)
                    .WithMessage("Open time must be before close time");
            });
        }
    }
}