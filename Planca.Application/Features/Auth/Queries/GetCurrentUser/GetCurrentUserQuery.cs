using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using Planca.Application.Common.Interfaces;

namespace Planca.Application.Features.Auth.Queries.GetCurrentUser
{
    // Update Planca.Application/Features/Auth/Queries/GetCurrentUser/GetCurrentUserQuery.cs
    public class GetCurrentUserQuery : IRequest<Result<UserDto>>, ICacheableQuery<Result<UserDto>>
    {
        // Cached userId value for use in building the cache key
        private string _userId;

        // Properties for caching
        // This is a placeholder - the actual cache key will be created in the handler
        public string CacheKey => $"current_user_{_userId ?? "unknown"}";
        public TimeSpan? CacheDuration => TimeSpan.FromMinutes(5);

        // Method to set the userId for cache key generation
        public void SetUserId(string userId)
        {
            _userId = userId;
        }
    }
}