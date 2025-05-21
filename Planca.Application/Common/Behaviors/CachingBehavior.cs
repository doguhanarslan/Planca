// Planca.Application/Common/Behaviours/CachingBehavior.cs
using MediatR;
using Planca.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Common.Behaviours
{
    public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : ICacheableQuery<TResponse>
    {
        private readonly ICacheService _cacheService;

        public CachingBehavior(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            if (!request.BypassCache && request.CacheKey != null)
            {
                return await _cacheService.GetOrCreateAsync(
                    request.CacheKey,
                    () => next(),
                    request.CacheDuration,
                    request.BypassCache);
            }

            // Cache key yok veya bypass aktif - direkt olarak handler'ı çalıştır
            return await next();
        }
    }
}