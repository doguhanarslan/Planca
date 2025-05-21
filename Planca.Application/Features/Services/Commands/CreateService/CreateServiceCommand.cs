using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Interfaces;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Services.Commands.CreateService
{
    public class CreateServiceCommand : IRequest<Result<ServiceDto>>, ITenantRequest, ICacheInvalidatorCommand<Result<ServiceDto>>
    {
        // Servis bilgileri
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsActive { get; set; } = true;
        public string Color { get; set; } = "#3498db"; // Varsayılan renk

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }
        public string CacheKeyToInvalidate => null; // Belirli bir key yerine pattern kullanıyoruz
        public string CacheKeyPatternToInvalidate => "services_list";
    }
}