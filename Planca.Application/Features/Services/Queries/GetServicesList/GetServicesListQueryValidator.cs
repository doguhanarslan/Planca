using FluentValidation;

namespace Planca.Application.Features.Services.Queries.GetServicesList
{
    public class GetServicesListQueryValidator : AbstractValidator<GetServicesListQuery>
    {
        public GetServicesListQueryValidator()
        {
            RuleFor(x => x.PageNumber)
                .GreaterThanOrEqualTo(1).WithMessage("PageNumber must be at least 1.");

            RuleFor(x => x.PageSize)
                .GreaterThanOrEqualTo(1).WithMessage("PageSize must be at least 1.")
                .LessThanOrEqualTo(100).WithMessage("PageSize must not exceed 100.");

            RuleFor(x => x.SortBy)
                .Must(x => string.IsNullOrEmpty(x) ||
                           new[] { "Name", "Price", "Duration", "CreatedAt" }.Contains(x))
                .WithMessage("SortBy is invalid. Valid values are: Name, Price, Duration, CreatedAt.");

            When(x => x.MaxPrice.HasValue, () => {
                RuleFor(x => x.MaxPrice)
                    .GreaterThan(0).WithMessage("MaxPrice must be greater than 0.")
                    .When(x => x.MaxPrice.HasValue);
            });
        }
    }
}