using FluentValidation;

namespace Planca.Application.Features.Tenants.Commands.DeleteTenant
{
    public class DeleteTenantCommandValidator : AbstractValidator<DeleteTenantCommand>
    {
        public DeleteTenantCommandValidator()
        {
            RuleFor(v => v.Id)
                .NotEmpty().WithMessage("Tenant ID is required");
        }
    }
}