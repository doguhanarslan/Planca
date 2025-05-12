using MediatR;
using Planca.Application.Common.Behaviors;
using Planca.Application.Common.Models;
using Planca.Application.DTOs;
using System;

namespace Planca.Application.Features.Services.Commands.UpdateService
{
    public class UpdateServiceCommand : IRequest<Result<ServiceDto>>, ITenantRequest
    {
        // Güncellenecek servis ID'si
        public Guid Id { get; set; }

        // Servis bilgileri
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsActive { get; set; }
        public string Color { get; set; } = string.Empty;

        // Tenant ID, TenantBehavior tarafından doldurulacak
        public Guid TenantId { get; set; }
    }
}