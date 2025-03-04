using FluentValidation;
using System;

namespace Planca.Application.Features.Employees.Queries.GetEmployeesByService
{
    public class GetEmployeesByServiceQueryValidator : AbstractValidator<GetEmployeesByServiceQuery>
    {
        public GetEmployeesByServiceQueryValidator()
        {
            RuleFor(x => x.ServiceId)
                .NotEmpty().WithMessage("Service ID is required");
        }
    }
}