using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using Planca.Application.Common.Interfaces;

namespace Planca.Application.Common.Behaviors
{
    public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly ILogger<TRequest> _logger;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICurrentTenantService _currentTenantService;

        public LoggingBehavior(
            ILogger<TRequest> logger,
            ICurrentUserService currentUserService,
            ICurrentTenantService currentTenantService)
        {
            _logger = logger;
            _currentUserService = currentUserService;
            _currentTenantService = currentTenantService;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;
            var userId = _currentUserService.UserId ?? "anonymous";
            var tenantId = _currentTenantService.GetTenantId();
            var tenantName = _currentTenantService.GetTenantName() ?? "unknown";

            _logger.LogInformation(
                "Handling {RequestName} for user {UserId} in tenant {TenantName} ({TenantId})",
                requestName, userId, tenantName, tenantId);

            try
            {
                var response = await next();

                _logger.LogInformation(
                    "Handled {RequestName} successfully for user {UserId} in tenant {TenantName} ({TenantId})",
                    requestName, userId, tenantName, tenantId);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error handling {RequestName} for user {UserId} in tenant {TenantName} ({TenantId}): {ErrorMessage}",
                    requestName, userId, tenantName, tenantId, ex.Message);

                throw;
            }
        }
    }
}