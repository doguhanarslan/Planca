using Microsoft.AspNetCore.Identity;
using Planca.Application.Common.Models;
using System.Linq;

namespace Planca.Infrastructure.Identity.Extensions
{
    public static class IdentityResultExtensions
    {
        public static Result ToApplicationResult(this IdentityResult identityResult)
        {
            return identityResult.Succeeded
                ? Result.Success()
                : Result.Failure(identityResult.Errors.Select(e => e.Description).ToArray());
        }
    }
}