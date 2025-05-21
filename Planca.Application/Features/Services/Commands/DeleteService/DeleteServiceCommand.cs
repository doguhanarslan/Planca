using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.Common.Interfaces;
using System;

namespace Planca.Application.Features.Services.Commands.DeleteService
{
    public class DeleteServiceCommand : IRequest<Result>, ITenantRequest, ICacheInvalidatorCommand<Result>
    {
        // Silinecek servis ID'si
        public Guid Id { get; set; }

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }

        public string CacheKeyToInvalidate => null;
        public string CacheKeyPatternToInvalidate => "services_list";
    }
}