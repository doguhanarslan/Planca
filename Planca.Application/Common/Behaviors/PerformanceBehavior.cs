using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Interfaces;

namespace Planca.Application.Common.Behaviors
{
    public class PerformanceBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly Stopwatch _timer;
        private readonly ILogger<TRequest> _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICurrentTenantService _currentTenantService;

        public PerformanceBehavior(
            ILogger<TRequest> logger,
            ICurrentUserService currentUserService,
            ICurrentTenantService currentTenantService)
        {
            _timer = new Stopwatch();
            _logger = logger;
            _currentUserService = currentUserService;
            _currentTenantService = currentTenantService;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            _timer.Start();

            var response = await next();

            _timer.Stop();

            var elapsedMilliseconds = _timer.ElapsedMilliseconds;

            // Log warning if the request takes longer than 500ms
            if (elapsedMilliseconds > 500)
            {
                var requestName = typeof(TRequest).Name;
                var userId = _currentUserService.UserId ?? "anonymous";
                var tenantName = _currentTenantService.GetTenantName() ?? "unknown";

                _logger.LogWarning(
                    "Long running request: {RequestName} ({ElapsedMilliseconds}ms) for user {UserId} in tenant {TenantName}",
                    requestName, elapsedMilliseconds, userId, tenantName);
            }

            return response;
        }
    }
}