using FluentValidation;

namespace Planca.Application.Features.Employees.Commands.DeleteEmployee
{
    public class DeleteEmployeeCommandValidator : AbstractValidator<DeleteEmployeeCommand>
    {
        public DeleteEmployeeCommandValidator()
        {
            RuleFor(v => v.Id)
                .NotEmpty().WithMessage("Employee ID is required");
        }
    }
}