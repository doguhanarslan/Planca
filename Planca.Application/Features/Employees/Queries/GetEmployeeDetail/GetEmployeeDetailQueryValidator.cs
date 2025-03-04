using FluentValidation;
using System;

namespace Planca.Application.Features.Employees.Queries.GetEmployeeDetail
{
    public class GetEmployeeDetailQueryValidator : AbstractValidator<GetEmployeeDetailQuery>
    {
        public GetEmployeeDetailQueryValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Employee ID is required");
        }
    }
}