using FluentValidation;
using Planca.Domain.Common.Interfaces;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Features.Customers.Commands.CreateCustomer
{
    public class CreateCustomerCommandValidator : AbstractValidator<CreateCustomerCommand>
    {
        private readonly ICustomerRepository _customerRepository;

        public CreateCustomerCommandValidator(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;

            RuleFor(v => v.FirstName)
                .NotEmpty().WithMessage("First name is required")
                .MaximumLength(100).WithMessage("First name must not exceed 100 characters");

            RuleFor(v => v.LastName)
                .NotEmpty().WithMessage("Last name is required")
                .MaximumLength(100).WithMessage("Last name must not exceed 100 characters");

            RuleFor(v => v.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Email is not valid")
                .MaximumLength(255).WithMessage("Email must not exceed 255 characters")
                .MustAsync(BeUniqueEmail).WithMessage("The specified email is already in use.");

            RuleFor(v => v.PhoneNumber)
                .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters");

            RuleFor(v => v.Notes)
                .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters");
        }

        private async Task<bool> BeUniqueEmail(string email, CancellationToken cancellationToken)
        {
            return await _customerRepository.IsEmailUniqueAsync(email);
        }
    }
}