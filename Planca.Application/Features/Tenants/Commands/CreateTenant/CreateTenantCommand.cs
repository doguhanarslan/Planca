using MediatR;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Tenants.Commands.CreateTenant
{
    // Not: Tenant Command'leri ITenantRequest değil, çünkü tenant yönetimi özel bir durumdur
    public class CreateTenantCommand : IRequest<Result<TenantDto>>
    {
        public string Name { get; set; } = string.Empty;
        public string Subdomain { get; set; } = string.Empty;
        public string LogoUrl { get; set; } = string.Empty;
        public string PrimaryColor { get; set; } = "#3498db"; // Default color
        public bool IsActive { get; set; } = true;
        public string? ConnectionString { get; set; }
    }
}