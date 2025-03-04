using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Tenants.Queries.GetTenantDetail
{
    public class GetTenantDetailQuery : IRequest<Result<TenantDto>>
    {
        public Guid Id { get; set; }
    }
}