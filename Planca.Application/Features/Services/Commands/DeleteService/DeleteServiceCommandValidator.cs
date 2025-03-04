using FluentValidation;

namespace Planca.Application.Features.Services.Commands.DeleteService
{
    public class DeleteServiceCommandValidator : AbstractValidator<DeleteServiceCommand>
    {
        public DeleteServiceCommandValidator()
        {
            RuleFor(v => v.Id)
                .NotEmpty().WithMessage("Service ID is required");
        }
    }
}