using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.Common.Interfaces;
using System;
using Planca.Application.DTOs;

namespace Planca.Application.Features.Tenants.Commands.DeleteTenant
{
    public class DeleteTenantCommand : IRequest<Result>, ICacheInvalidatorCommand<Result>
    {
        public Guid Id { get; set; }

        public string CacheKeyToInvalidate => $"tenant_detail_{Id}"; // Invalidate specific tenant detail
        public string CacheKeyPatternToInvalidate => "tenants_list";
    }
}