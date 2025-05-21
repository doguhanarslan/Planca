using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Common.Interfaces;

namespace Planca.Application.Features.Auth.Queries.GetCurrentUser
{
    public class GetCurrentUserQuery : IRequest<Result<UserDto>>, ICacheableQuery<Result<UserDto>>
    {
        // No properties needed - the user will be determined from the JWT token
        public string CacheKey => $"current_user_{{user_id}}"; // user_id runtime'da eklenmeli
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(5);

    }
}