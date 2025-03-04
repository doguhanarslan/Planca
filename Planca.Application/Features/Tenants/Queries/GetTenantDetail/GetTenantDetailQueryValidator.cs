using FluentValidation;
using System;

namespace Planca.Application.Features.Tenants.Queries.GetTenantDetail
{
    public class GetTenantDetailQueryValidator : AbstractValidator<GetTenantDetailQuery>
    {
        public GetTenantDetailQueryValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Tenant ID is required");
        }
    }
}