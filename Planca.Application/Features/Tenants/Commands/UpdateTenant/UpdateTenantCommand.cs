using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Tenants.Commands.UpdateTenant
{
    public class UpdateTenantCommand : IRequest<Result<TenantDto>>
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subdomain { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string PrimaryColor { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public string? ConnectionString { get; set; }
    }
}