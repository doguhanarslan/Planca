using FluentValidation;
using System;
using System.Text.RegularExpressions;

namespace Planca.Application.Features.Tenants.Commands.UpdateTenant
{
    public class UpdateTenantCommandValidator : AbstractValidator<UpdateTenantCommand>
    {
        public UpdateTenantCommandValidator()
        {
            RuleFor(v => v.Id)
                .NotEmpty().WithMessage("Tenant ID is required");

            RuleFor(v => v.Name)
                .NotEmpty().WithMessage("Tenant name is required")
                .MaximumLength(100).WithMessage("Tenant name must not exceed 100 characters");

            RuleFor(v => v.Subdomain)
                .NotEmpty().WithMessage("Subdomain is required")
                .MaximumLength(50).WithMessage("Subdomain must not exceed 50 characters")
                .Matches(new Regex("^[a-z0-9]+(-[a-z0-9]+)*$"))
                .WithMessage("Subdomain can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen");

            RuleFor(v => v.LogoUrl)
                .MaximumLength(1000).WithMessage("Logo URL must not exceed 1000 characters");

            RuleFor(v => v.PrimaryColor)
                .NotEmpty().WithMessage("Primary color is required")
                .Matches("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
                .WithMessage("Color must be a valid hex color code (e.g. #3498db)");
        }
    }
}