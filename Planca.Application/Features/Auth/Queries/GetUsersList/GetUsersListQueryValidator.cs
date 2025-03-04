using FluentValidation;

namespace Planca.Application.Features.Auth.Queries.GetUsersList
{
    public class GetUsersListQueryValidator : AbstractValidator<GetUsersListQuery>
    {
        public GetUsersListQueryValidator()
        {
            RuleFor(x => x.PageNumber)
                .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1");

            RuleFor(x => x.PageSize)
                .GreaterThanOrEqualTo(1).WithMessage("Page size must be at least 1")
                .LessThanOrEqualTo(100).WithMessage("Page size must not exceed 100");

            RuleFor(x => x.SortBy)
                .Must(sortBy => string.IsNullOrEmpty(sortBy) ||
                      new[] { "UserName", "Email", "FullName", "CreatedAt" }.Contains(sortBy))
                .WithMessage("SortBy is invalid. Valid values are: UserName, Email, FullName, CreatedAt");
        }
    }
}