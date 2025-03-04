using FluentValidation;
using Planca.Application.Features.Customers.Queries.GetCustomerDetail;
using System;

namespace Planca.Application.Features.Customers.Queries.GetCustomerDetail
{
    public class GetCustomerDetailQueryValidator : AbstractValidator<GetCustomerDetailQuery>
    {
        public GetCustomerDetailQueryValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Customer ID is required");
        }
    }
}