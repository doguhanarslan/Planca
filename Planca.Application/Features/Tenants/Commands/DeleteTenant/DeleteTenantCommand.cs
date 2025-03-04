using MediatR;
using Planca.Application.Common.Models;
using System;

namespace Planca.Application.Features.Tenants.Commands.DeleteTenant
{
    public class DeleteTenantCommand : IRequest<Result>
    {
        public Guid Id { get; set; }
    }
}