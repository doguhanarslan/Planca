using FluentValidation;
using System;

namespace Planca.Application.Features.Services.Queries.GetServiceDetail
{
    public class GetServiceDetailQueryValidator : AbstractValidator<GetServiceDetailQuery>
    {
        public GetServiceDetailQueryValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Service ID is required");
        }
    }
}