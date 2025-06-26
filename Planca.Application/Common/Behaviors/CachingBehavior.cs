// Planca.Application/Common/Behaviours/CachingBehavior.cs
using MediatR;
using Planca.Application.Common.Interfaces;
using Planca.Application.Features.Auth.Queries.GetCurrentUser;
using System;
using System.Reflection.Metadata.Ecma335;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Common.Behaviours
{
    public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : ICacheableQuery<TResponse>
    {
        private readonly ICacheService _cacheService;
        private readonly ICurrentUserService _currentUserService;


        public CachingBehavior(ICacheService cacheService, ICurrentUserService currentUserService)
        {
            _cacheService = cacheService;
            _currentUserService = currentUserService;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (request is GetCurrentUserQuery currentUserQuery)
            {
                var userId = _currentUserService.UserId;
                if (string.IsNullOrEmpty(userId))
                {
                    // If no user ID, don't use cache
                    return await next();
                }

                // Set the user ID for cache key generation
                currentUserQuery.SetUserId(userId);
            }

            if (request.CacheKey != null)
            {
                // Check if request has a bypass cache property
                var bypassCache = false;
                var bypassProperty = request.GetType().GetProperty("BypassCache");
                if (bypassProperty != null && bypassProperty.PropertyType == typeof(bool))
                {
                    bypassCache = (bool)bypassProperty.GetValue(request);
                }

                return await _cacheService.GetOrCreateAsync(
                    request.CacheKey,
                    () => next(),
                    request.CacheDuration,
                    bypassCache);
            }

            // Cache key yok - direkt olarak handler'ı çalıştır
            return await next();
        }
    }
}