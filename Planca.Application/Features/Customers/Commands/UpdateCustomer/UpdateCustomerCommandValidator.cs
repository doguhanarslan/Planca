using FluentValidation;

namespace Planca.Application.Features.Customers.Commands.UpdateCustomer
{
    public class UpdateCustomerCommandValidator : AbstractValidator<UpdateCustomerCommand>
    {
        public UpdateCustomerCommandValidator()
        {
            RuleFor(v => v.Id)
                .NotEmpty().WithMessage("ID is required");

            RuleFor(v => v.FirstName)
                .NotEmpty().WithMessage("First name is required")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters");

            RuleFor(v => v.LastName)
                .NotEmpty().WithMessage("Last name is required")
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters");

            RuleFor(v => v.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Email is not valid")
                .MaximumLength(255).WithMessage("Email must not exceed 255 characters");

            RuleFor(v => v.PhoneNumber)
                .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters");

            

            RuleFor(v => v.Notes)
                .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters");
        }
    }
}