using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Services.Queries.GetServiceDetail
{
    public class GetServiceDetailQuery : IRequest<Result<ServiceDto>>, ITenantRequest
    {
        // Görüntülenecek servis ID'si
        public Guid Id { get; set; }

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid? TenantId { get; set; }
    }
}