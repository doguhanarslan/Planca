using Planca.Application.Common.Interfaces;
using MediatR;

namespace Planca.Application.Common.Behaviors
{
    public class TenantBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly ICurrentTenantService _tenantService;

        public TenantBehavior(ICurrentTenantService tenantService)
        {
            _tenantService = tenantService;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            // Check if request is tenant-aware
            if (request is ITenantRequest tenantRequest)
            {
                var tenantId = _tenantService.GetTenantId();

                if (tenantId == Guid.Empty)
                {
                    throw new UnauthorizedAccessException("Tenant context is not established");
                }

                tenantRequest.TenantId = tenantId;
            }

            return await next();
        }
    }

    // Interface to mark commands/queries that need tenant ID
    public interface ITenantRequest
    {
        Guid TenantId { get; set; }
    }
}