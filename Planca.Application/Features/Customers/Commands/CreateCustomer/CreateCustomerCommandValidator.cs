using FluentValidation;

namespace Planca.Application.Features.Customers.Commands.CreateCustomer
{
    public class CreateCustomerCommandValidator : AbstractValidator<CreateCustomerCommand>
    {
        public CreateCustomerCommandValidator()
        {
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

            When(v => v.Address != null, () =>
            {
                RuleFor(v => v.Address.Street)
                    .MaximumLength(200).WithMessage("Street must not exceed 200 characters");

                RuleFor(v => v.Address.City)
                    .MaximumLength(100).WithMessage("City must not exceed 100 characters");

                RuleFor(v => v.Address.State)
                    .MaximumLength(100).WithMessage("State must not exceed 100 characters");

                RuleFor(v => v.Address.ZipCode)
                    .MaximumLength(20).WithMessage("Zip code must not exceed 20 characters");

                RuleFor(v => v.Address.Country)
                    .MaximumLength(100).WithMessage("Country must not exceed 100 characters");
            });

            RuleFor(v => v.Notes)
                .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters");
        }
    }
}