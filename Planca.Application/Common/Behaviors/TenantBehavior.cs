using Planca.Application.Common.Interfaces;
using MediatR;
using Planca.Application.Features.Auth.Commands.Login;
using Planca.Application.Features.Auth.Commands.RefreshToken;
using Planca.Application.Features.Auth.Commands.Register;
using Planca.Application.Features.Tenants.Commands.CreateBusiness;

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
            // Tenant doğrulamasından muaf tutulacak işlemler
            bool isExempt = request is RegisterCommand ||
                            request is LoginCommand ||
                            request is RefreshTokenCommand ||
                            request is CreateBusinessCommand; // Ekledik

            // Tenant doğrulaması gerekli mi kontrol et
            if (request is ITenantRequest tenantRequest && !isExempt)
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