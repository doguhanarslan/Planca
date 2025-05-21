using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.Common.Interfaces;
using System;

namespace Planca.Application.Features.Tenants.Commands.DeleteTenant
{
    public class DeleteTenantCommand : IRequest<Result>
    {
        public Guid Id { get; set; }
    }
}