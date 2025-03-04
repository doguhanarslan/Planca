﻿using FluentValidation;

namespace Planca.Application.Features.Employees.Queries.GetEmployeesList
{
    public class GetEmployeesListQueryValidator : AbstractValidator<GetEmployeesListQuery>
    {
        public GetEmployeesListQueryValidator()
        {
            RuleFor(x => x.PageNumber)
                .GreaterThanOrEqualTo(1).WithMessage("PageNumber must be at least 1.");

            RuleFor(x => x.PageSize)
                .GreaterThanOrEqualTo(1).WithMessage("PageSize must be at least 1.")
                .LessThanOrEqualTo(100).WithMessage("PageSize must not exceed 100.");

            RuleFor(x => x.SortBy)
                .Must(x => string.IsNullOrEmpty(x) ||
                      new[] { "FirstName", "LastName", "Email", "Title", "CreatedAt" }.Contains(x))
                .WithMessage("SortBy is invalid. Valid values are: FirstName, LastName, Email, Title, CreatedAt.");
        }
    }
}