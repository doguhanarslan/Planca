using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using System;

namespace Planca.Application.Features.Services.Commands.DeleteService
{
    public class DeleteServiceCommand : IRequest<Result>, ITenantRequest
    {
        // Silinecek servis ID'si
        public Guid Id { get; set; }

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }
    }
}