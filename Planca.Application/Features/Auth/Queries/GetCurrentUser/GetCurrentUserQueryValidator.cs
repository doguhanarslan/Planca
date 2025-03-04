using FluentValidation;

namespace Planca.Application.Features.Auth.Queries.GetCurrentUser
{
    public class GetCurrentUserQueryValidator : AbstractValidator<GetCurrentUserQuery>
    {
        public GetCurrentUserQueryValidator()
        {
            // No validation rules needed as this query has no properties
        }
    }
}