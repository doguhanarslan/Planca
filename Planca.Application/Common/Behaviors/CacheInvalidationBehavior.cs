// Planca.Application/Common/Behaviours/CacheInvalidationBehavior.cs
using MediatR;
using Planca.Application.Common.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Planca.Application.Common.Behaviours
{
    public class CacheInvalidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : ICacheInvalidatorCommand<TResponse>
    {
        private readonly ICacheService _cacheService;

        public CacheInvalidationBehavior(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request));

            // Önce command'i çalıştır
            var response = await next();

            // Command başarılı ise cache invalidation işlemleri yapılır
            if (request.CacheKeyToInvalidate != null)
            {
                await _cacheService.RemoveAsync(request.CacheKeyToInvalidate);
            }

            if (request.CacheKeyPatternToInvalidate != null)
            {
                await _cacheService.RemoveByPatternAsync(request.CacheKeyPatternToInvalidate);
            }

            return response;
        }
    }
}